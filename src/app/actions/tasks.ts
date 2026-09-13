"use server";

import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. Fetch tasks for a selected day
export async function getDayTasks(
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
) {
  try {
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

export async function submitDailyLog({
  taskId,
  loggedSummary,
}: {
  taskId: string;
  loggedSummary: string;
}) {
  if (!taskId || !loggedSummary.trim()) {
    return { success: false, message: "A valid filing summary is required." };
  }

  try {
    await db
      .update(tasks)
      .set({
        loggedSummary: loggedSummary.trim(),
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
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let verifierId: string | null = null;
    if (authUser?.email) {
      const [editor] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, authUser.email.toLowerCase()))
        .limit(1);

      if (editor) {
        verifierId = editor.id;
      }
    }

    await db
      .update(tasks)
      .set({
        status: approved ? "COMPLETED" : "FLAGGED",
        verifiedById: verifierId,
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
  if (!title || !unitId || !dayOfWeek) {
    return { success: false, message: "Title, desk, and rundown day are required." };
  }

  try {
    await db.insert(tasks).values({
      title: title.trim(),
      description: description?.trim() || null,
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
  if (!taskId || !title?.trim()) {
    return { success: false, message: "Task ID and title are required." };
  }

  try {
    const updatePayload: Partial<typeof tasks.$inferInsert> = {
      title: title.trim(),
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


export async function deleteTask(taskId: string) {
  if (!taskId) {
    return { success: false, message: "Task ID is required." };
  }

  try {
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


export const deleteTaskAction = deleteTask;