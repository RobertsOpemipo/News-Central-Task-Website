"use server";

import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

// 1. Fetch tasks for a selected day (Accessible by any authenticated user)
export async function getDayTasks(
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return [];
    }

    const records = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dayOfWeek: tasks.dayOfWeek,
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
      .where(eq(tasks.dayOfWeek, day))
      .orderBy(desc(tasks.createdAt));

    return records;
  } catch (error) {
    console.error("Failed to query tasks for day:", day, error);
    return [];
  }
}

// 2. Submit daily work filing (Sanitized string length & auth verification)
export async function submitDailyLog({
  taskId,
  loggedSummary,
}: {
  taskId: string;
  loggedSummary: string;
}) {
  const cleanSummary = loggedSummary?.trim();

  if (!taskId || !cleanSummary) {
    return { success: false, message: "A valid filing summary is required." };
  }

  if (cleanSummary.length > 2500) {
    return { success: false, message: "Summary exceeds 2500 character limit." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    // Verify task exists
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      return { success: false, message: "Story record not found." };
    }

    // Role check: Only the assignee, unit lead, or admin can file logs for this story
    if (
      user.role === "MEMBER" &&
      existingTask.assignedToId &&
      existingTask.assignedToId !== user.id
    ) {
      return {
        success: false,
        message: "Forbidden: You are only allowed to file proof for your assigned stories.",
      };
    }

    await db
      .update(tasks)
      .set({
        loggedSummary: cleanSummary,
        loggedAt: new Date(),
        status: "AWAITING_REVIEW",
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/oversight");
    revalidatePath("/dashboard/schedule");
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
export async function verifyTaskAction({
  taskId,
  approved,
}: {
  taskId: string;
  approved: boolean;
}) {
  if (!taskId) {
    return { success: false, message: "Task ID is required." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized: Session expired." };
    }

    // Hard RBAC constraint: Correspondents cannot verify or seal packages
    if (user.role !== "UNIT_LEAD" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Desk Leads and Editors can clear packages for broadcast.",
      };
    }

    await db
      .update(tasks)
      .set({
        status: approved ? "COMPLETED" : "FLAGGED",
        verifiedById: user.id,
        verifiedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/oversight");
    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (error: unknown) {
    console.error("Verification action failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}

// 4. Schedule & Assign News Package (Input Sanitization & Length Guard)
export async function createAssignedTask({
  title,
  description,
  dayOfWeek,
  unitId,
  assignedToId,
}: {
  title: string;
  description?: string;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  unitId: string;
  assignedToId?: string;
}) {
  const cleanTitle = title?.trim();
  const cleanDesc = description?.trim() || null;

  if (!cleanTitle || !unitId || !dayOfWeek) {
    return { success: false, message: "Title, desk, and rundown day are required." };
  }

  if (cleanTitle.length > 250) {
    return { success: false, message: "Title cannot exceed 250 characters." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    await db.insert(tasks).values({
      title: cleanTitle,
      description: cleanDesc,
      dayOfWeek,
      unitId,
      assignedToId: assignedToId || null,
      status: "PENDING",
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/oversight");
    revalidatePath("/dashboard/schedule");
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
export async function updateTask({
  taskId,
  title,
  description,
  dayOfWeek,
  unitId,
  assignedToId,
}: {
  taskId: string;
  title: string;
  description?: string;
  dayOfWeek?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  unitId?: string;
  assignedToId?: string | null;
}) {
  const cleanTitle = title?.trim();

  if (!taskId || !cleanTitle) {
    return { success: false, message: "Task ID and title are required." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized: Please log in." };
    }

    const updatePayload: Partial<typeof tasks.$inferInsert> = {
      title: cleanTitle,
      description: description?.trim() || null,
    };

    if (dayOfWeek) updatePayload.dayOfWeek = dayOfWeek;
    if (unitId) updatePayload.unitId = unitId;
    if (assignedToId !== undefined) updatePayload.assignedToId = assignedToId || null;

    await db.update(tasks).set(updatePayload).where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/oversight");
    revalidatePath("/dashboard/schedule");
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
export async function deleteTask(taskId: string) {
  if (!taskId) {
    return { success: false, message: "Task ID is required." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    // Prevent regular members from deleting entire stories
    if (user.role !== "UNIT_LEAD" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Desk Leads or Admins can purge stories from the rundown.",
      };
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/oversight");
    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete story.",
    };
  }
}


// 7. Drag-and-drop reschedule action (ADMIN only)
export async function rescheduleTaskAction({
  taskId,
  targetDay,
}: {
  taskId: string;
  targetDay: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
}) {
  if (!taskId || !targetDay) {
    return { success: false, message: "Task ID and target day are required." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Managing Editors can reschedule broadcast packages.",
      };
    }

    await db
      .update(tasks)
      .set({ dayOfWeek: targetDay })
      .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/oversight");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to reschedule task:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reschedule task.",
    };
  }
}
// src/app/actions/tasks.ts
export async function rescheduleTaskToDateAction({
  taskId,
  targetDate,
}: {
  taskId: string;
  targetDate: string; // "YYYY-MM-DD"
}) {
  if (!taskId || !targetDate) {
    return { success: false, message: "Task ID and target date are required." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Forbidden: Only Managing Editors can reschedule broadcast packages.",
      };
    }

    const dateObj = new Date(targetDate);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
    const dayOfWeek = dayNames[dateObj.getUTCDay()];

    await db
      .update(tasks)
      .set({
        scheduledFor: targetDate,
        dayOfWeek,
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/oversight");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to reschedule task to date:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reschedule task.",
    };
  }
}

export const deleteTaskAction = deleteTask;