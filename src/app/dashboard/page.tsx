import { db } from "@/db";
import { units, users } from "@/db/schema";
import { getDayTasks } from "@/app/actions/tasks";
import { getCurrentUser } from "@/lib/auth";
import { TaskDeckView, type TaskItem, type OptionItem } from "@/app/dashboard/TaskDeckView";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const VALID_DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DashboardPageProps {
  searchParams: Promise<{ day?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const rawDay = resolvedParams.day;
  const currentDay: DayOfWeek = (
    rawDay && VALID_DAYS.includes(rawDay as DayOfWeek) ? rawDay : "Sun"
  ) as DayOfWeek;

  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  // Parallel fetch: day's tasks, desks, and users with concrete type bindings
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