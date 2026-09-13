
import { getDayTasks } from "@/app/actions/tasks";
import { TaskDeckView } from "@/app/dashboard/TaskDeckView";

interface PageProps {
  searchParams: Promise<{ day?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  const currentDay = days.includes(params.day as (typeof days)[number])
    ? (params.day as (typeof days)[number])
    : "Mon";

  // Fetch from Supabase via Drizzle
  const tasks = await getDayTasks(currentDay);

  return <TaskDeckView initialTasks={tasks} currentDay={currentDay} />;
}