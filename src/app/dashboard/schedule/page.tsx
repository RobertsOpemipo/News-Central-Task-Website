import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { BroadcastScheduleGrid } from "@/app/dashboard/BroadcastScheduleGrid";
import type { StatusType } from "@/components/ui/Badge";

export interface ScheduledTaskRecord {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  status: StatusType;
  unitName: string;
  assigneeName: string | null;
}

export default async function SchedulePage() {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const allTasks: ScheduledTaskRecord[] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dayOfWeek: tasks.dayOfWeek,
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
          Program telecast packages across the 7-day broadcast schedule.
        </p>
      </div>

      <BroadcastScheduleGrid tasks={allTasks} isAdmin={isAdmin} />
    </div>
  );
}