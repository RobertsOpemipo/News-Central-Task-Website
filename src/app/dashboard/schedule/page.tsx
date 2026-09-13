import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { BroadcastScheduleGrid } from "@/app/dashboard/BroadcastScheduleGrid";
import { CalendarDays, Radio } from "lucide-react";

export default async function SchedulePage() {
  const allScheduledTasks = await db
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
    .orderBy(asc(tasks.createdAt));

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Telecast Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Master Telecast & Rundown Schedule
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full 7-day programmatic grid across all editorial beats, wire ingests, and studio airtimes.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-mono shadow-2xs">
          <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>7-Day Cycle Grid</span>
        </div>
      </div>

      {/* Responsive Weekly Telecast Board */}
      <BroadcastScheduleGrid tasks={allScheduledTasks} />
    </div>
  );
}