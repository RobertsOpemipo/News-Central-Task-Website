import { z } from "zod";

export const DayOfWeekEnum = z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

export const SubmitLogSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
  loggedSummary: z
    .string()
    .trim()
    .min(5, "Please provide at least 5 characters explaining what was done.")
    .max(2500, "Log summary is too long (max 2500 characters)."),
});

export const VerifyTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
  approved: z.boolean(),
});

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  dayOfWeek: DayOfWeekEnum,
  unitId: z.string().uuid("Invalid unit ID."),
  assignedToId: z.string().uuid("Invalid assigned user ID.").optional().nullable(),
});

export const UpdateTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  dayOfWeek: DayOfWeekEnum.optional(),
  unitId: z.string().uuid("Invalid unit ID.").optional(),
  assignedToId: z.string().uuid("Invalid assigned user ID.").optional().nullable(),
});

export const RescheduleTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
  targetDay: DayOfWeekEnum,
});

export const RescheduleTaskToDateSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must follow YYYY-MM-DD format."),
});

export const DeleteTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format."),
});

export type SubmitLogInput = z.infer<typeof SubmitLogSchema>;
export type VerifyTaskInput = z.infer<typeof VerifyTaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;