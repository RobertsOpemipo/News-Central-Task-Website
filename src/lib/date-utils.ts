// src/lib/date-utils.ts
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  return DAYS_OF_WEEK[dayIndex];
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}