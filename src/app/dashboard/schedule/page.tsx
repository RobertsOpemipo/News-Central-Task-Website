// src/app/dashboard/schedule/page.tsx
import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { BroadcastScheduleGrid, type ScheduledTask } from "@/app/dashboard/BroadcastScheduleGrid";

export default async function SchedulePage() {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const allTasks: ScheduledTask[] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dayOfWeek: tasks.dayOfWeek,
      scheduledFor: tasks.scheduledFor,
      status: tasks.status,
      unitName: units.name,
      assigneeName: users.name,
    })
    .from(tasks)
    .innerJoin(units, eq(tasks.unitId, units.id))
    .leftJoin(users, eq(tasks.assignedToId, users.id))
    .orderBy(desc(tasks.createdAt));

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Broadcast Master Schedule
        </h1>
        <p className="text-xs text-slate-500">
          Full multi-year program calendar and telecast packages across the newsroom.
        </p>
      </div>

      <BroadcastScheduleGrid tasks={allTasks} isAdmin={isAdmin} />
    </div>
  );
}