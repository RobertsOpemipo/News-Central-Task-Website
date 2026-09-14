import { db } from "@/db";
import { tasks, units, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { OversightTable, type TaskRecord } from "@/app/dashboard/OversightTable";

export default async function OversightPage() {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const allRecords: TaskRecord[] = await db
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
    .orderBy(desc(tasks.createdAt));

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Editorial Clearance Oversight
        </h1>
        <p className="text-xs text-slate-500">
          Verify filed reporter proofs, sign off on prime telecasts, or flag rewrites.
        </p>
      </div>

      <OversightTable tasks={allRecords} isAdmin={isAdmin} />
    </div>
  );
}