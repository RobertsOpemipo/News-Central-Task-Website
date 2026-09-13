import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { OversightTable } from "@/app/dashboard/OversightTable";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default async function OversightPage() {
  const allTasks = await db
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
    })
    .from(tasks)
    .innerJoin(units, eq(tasks.unitId, units.id))
    .leftJoin(users, eq(tasks.assignedToId, users.id))
    .orderBy(desc(tasks.loggedAt));

  const pendingVerificationCount = allTasks.filter(
    (t) => t.status === "AWAITING_REVIEW"
  ).length;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Top Desk Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Editorial Desk Oversight
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit filed reporting, review correspondent evidence, and approve packages for broadcast.
          </p>
        </div>

        {/* Real-time Verification Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>{pendingVerificationCount} packages awaiting review</span>
        </div>
      </div>

      {/* Oversight Review Table */}
      <OversightTable
        tasks={allTasks.map((task) => ({
          ...task,
          assigneeName: task.assigneeName ?? "Unassigned",
        }))}
      />
    </div>
  );
}