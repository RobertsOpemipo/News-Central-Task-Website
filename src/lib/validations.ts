// src/lib/validations.ts
import { z } from "zod";

export const SubmitLogSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  loggedSummary: z
    .string()
    .min(5, "Please provide at least 5 characters explaining what was done.")
    .max(1500, "Log summary is too long (max 1500 characters)."),
});

export const VerifyTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  action: z.enum(["APPROVE", "REJECT"]),
  reviewerId: z.string().uuid("Invalid reviewer ID"),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  dayOfWeek: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  unitId: z.string().uuid("Invalid unit ID"),
  assignedToId: z.string().uuid("Invalid assigned user ID"),
});

export type SubmitLogInput = z.infer<typeof SubmitLogSchema>;
export type VerifyTaskInput = z.infer<typeof VerifyTaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;