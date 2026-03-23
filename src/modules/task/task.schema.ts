import z from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
});

export const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
