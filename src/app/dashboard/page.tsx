// src/app/dashboard/page.tsx
import { db } from "@/db";
import { units, users } from "@/db/schema";
import { getDayTasks } from "@/app/actions/tasks";
import { getCurrentUser } from "@/lib/auth";
import { TaskDeckView, type TaskItem, type OptionItem } from "@/app/dashboard/TaskDeckView";
import { getTodayDayOfWeek, type DayOfWeek, DAYS_OF_WEEK } from "@/lib/date-utils";

interface DashboardPageProps {
  searchParams: Promise<{ day?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const rawDay = resolvedParams.day as DayOfWeek | undefined;

  // Fallback dynamically to today's real day if not specified in searchParams
  const currentDay: DayOfWeek =
    rawDay && DAYS_OF_WEEK.includes(rawDay) ? rawDay : getTodayDayOfWeek();

  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [tasksList, allUnits, allUsers]: [TaskItem[], OptionItem[], OptionItem[]] =
    await Promise.all([
      getDayTasks(currentDay) as Promise<TaskItem[]>,
      db.select({ id: units.id, name: units.name }).from(units),
      db.select({ id: users.id, name: users.name }).from(users),
    ]);

  return (
    <TaskDeckView
      initialTasks={tasksList}
      currentDay={currentDay}
      availableUnits={allUnits}
      availableUsers={allUsers}
      isAdmin={isAdmin}
    />
  );
}