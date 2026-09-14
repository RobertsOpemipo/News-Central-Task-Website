// src/app/actions/tasks.ts
"use server";

import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  SubmitLogSchema,
  VerifyTaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  RescheduleTaskSchema,
  RescheduleTaskToDateSchema,
  DeleteTaskSchema,
  DayOfWeekEnum,
} from "@/lib/validations";

// Simple in-memory rate limiter per user session
const rateLimitTracker = new Map<string, { count: number; resetAt: number }>();

function assertRateLimit(userId: string, limit = 25, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitTracker.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitTracker.set(userId, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new Error("Too many requests. Please pause before executing further commands.");
  }

  entry.count += 1;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return null;
  }

  const [dbUser] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      unitId: users.unitId,
    })
    .from(users)
    .where(eq(users.email, authUser.email.toLowerCase()))
    .limit(1);

  return dbUser || null;
}

function refreshAllTaskViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/oversight");
  revalidatePath("/dashboard/schedule");
}

// 1. Fetch tasks for a selected day (Any authenticated user)
export async function getDayTasks(day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun") {
  try {
    const validDay = DayOfWeekEnum.parse(day);
    const user = await getAuthenticatedUser();
    if (!user) return [];

    const records = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dayOfWeek: tasks.dayOfWeek,
        scheduledFor: tasks.scheduledFor,
        status: tasks.status,
        loggedSummary: tasks.loggedSummary,
        loggedAt: tasks.loggedAt,
        unitName: units.name,
        assigneeName: users.name,
        assigneeEmail: users.email,
      })
      .from(tasks)
      .innerJoin(units, eq(tasks.unitId, units.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(eq(tasks.dayOfWeek, validDay))
      .orderBy(desc(tasks.createdAt));

    return records;
  } catch (error) {
    console.error("Failed to query tasks for day:", day, error);
    return [];
  }
}

// 2. Submit daily work filing (Sanitized via Zod & Assignee Role Guard)
export async function submitDailyLog(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    assertRateLimit(user.id, 15, 60_000);
    const input = SubmitLogSchema.parse(rawInput);

    const [existingTask] = await db
      .select({
        id: tasks.id,
        assignedToId: tasks.assignedToId,
      })
      .from(tasks)
      .where(eq(tasks.id, input.taskId))
      .limit(1);

    if (!existingTask) {
      return { success: false, message: "Story record not found." };
    }

    // Role check: MEMBER can only submit proof for their assigned story
    if (
      user.role === "MEMBER" &&
      existingTask.assignedToId &&
      existingTask.assignedToId !== user.id
    ) {
      return {
        success: false,
        message: "Forbidden: You may only file proof for your designated stories.",
      };
    }

    await db
      .update(tasks)
      .set({
        loggedSummary: input.loggedSummary,
        loggedAt: new Date(),
        status: "AWAITING_REVIEW",
      })
      .where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to submit daily log:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit log.",
    };
  }
}

// 3. Editorial Lead Desk Verification (RBAC: UNIT_LEAD or ADMIN ONLY)
export async function verifyTaskAction(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized: Session expired." };
    }

    if (user.role !== "UNIT_LEAD" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Desk Leads and Admins can seal or flag packages.",
      };
    }

    assertRateLimit(user.id, 30, 60_000);
    const input = VerifyTaskSchema.parse(rawInput);

    await db
      .update(tasks)
      .set({
        status: input.approved ? "COMPLETED" : "FLAGGED",
        verifiedById: user.id,
        verifiedAt: new Date(),
      })
      .where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Verification action failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}

// 4. Schedule & Assign News Package (ADMIN or UNIT_LEAD)
export async function createAssignedTask(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    if (user.role !== "UNIT_LEAD" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: You do not have permission to assign packages.",
      };
    }

    assertRateLimit(user.id, 20, 60_000);
    const input = CreateTaskSchema.parse(rawInput);

    await db.insert(tasks).values({
      title: input.title,
      description: input.description ?? null,
      dayOfWeek: input.dayOfWeek,
      unitId: input.unitId,
      assignedToId: input.assignedToId ?? null,
      status: "PENDING",
    });

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create assigned task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to schedule story.",
    };
  }
}

// 5. Update Task Details (CRUD: Update)
export async function updateTask(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized: Please log in." };
    }

    if (user.role !== "UNIT_LEAD" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: You do not have permission to modify rundown records.",
      };
    }

    assertRateLimit(user.id, 30, 60_000);
    const input = UpdateTaskSchema.parse(rawInput);

    const updatePayload: Partial<typeof tasks.$inferInsert> = {
      title: input.title,
      description: input.description ?? null,
    };

    if (input.dayOfWeek) updatePayload.dayOfWeek = input.dayOfWeek;
    if (input.unitId) updatePayload.unitId = input.unitId;
    if (input.assignedToId !== undefined) {
      updatePayload.assignedToId = input.assignedToId ?? null;
    }

    await db.update(tasks).set(updatePayload).where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update story.",
    };
  }
}

export const updateTaskAction = updateTask;

// 6. Delete Task (CRUD: Delete with Role Guard)
export async function deleteTask(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    if (user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Managing Editors can purge stories from the rundown.",
      };
    }

    const payload = typeof rawInput === "string" ? { taskId: rawInput } : rawInput;
    const input = DeleteTaskSchema.parse(payload);

    await db.delete(tasks).where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete story.",
    };
  }
}

export const deleteTaskAction = deleteTask;

// 7. Drag-and-drop reschedule action by day enum (ADMIN only)
export async function rescheduleTaskAction(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Managing Editors can reschedule broadcast packages.",
      };
    }

    const input = RescheduleTaskSchema.parse(rawInput);

    await db
      .update(tasks)
      .set({ dayOfWeek: input.targetDay })
      .where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to reschedule task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reschedule task.",
    };
  }
}

// 8. Exact Date Drag-and-Drop Reschedule Action (ADMIN only)
export async function rescheduleTaskToDateAction(rawInput: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Managing Editors can reschedule broadcast packages.",
      };
    }

    const input = RescheduleTaskToDateSchema.parse(rawInput);

    const dateObj = new Date(input.targetDate);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
    const dayOfWeek = dayNames[dateObj.getUTCDay()];

    await db
      .update(tasks)
      .set({
        scheduledFor: input.targetDate,
        dayOfWeek,
      })
      .where(eq(tasks.id, input.taskId));

    refreshAllTaskViews();
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to reschedule task to date:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reschedule task.",
    };
  }
}