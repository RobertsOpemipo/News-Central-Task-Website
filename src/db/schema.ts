import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["MEMBER", "UNIT_LEAD", "ADMIN"]);
export const taskStatusEnum = pgEnum("task_status", [
  "PENDING",
  "AWAITING_REVIEW",
  "COMPLETED",
  "FLAGGED"
]);

// 1. Departments / Units Table
export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g., "Engineering", "Logistics", "Media"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").default("MEMBER").notNull(),
  unitId: uuid("unit_id").references(() => units.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Daily Scheduled Tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dayOfWeek: text("day_of_week").notNull(), // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  unitId: uuid("unit_id").references(() => units.id).notNull(),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  status: taskStatusEnum("status").default("PENDING").notNull(),
  loggedSummary: text("logged_summary"),
  loggedAt: timestamp("logged_at"),
  verifiedById: uuid("verified_by_id").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});