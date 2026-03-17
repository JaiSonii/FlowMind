import { z } from "zod"
import { TaskStatus, Priority } from "@prisma/client"

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().cuid("Invalid project ID"),
  assigneeId: z.string().cuid("Invalid assignee ID").optional().nullable(),
  parentId: z.string().cuid("Invalid parent task ID").optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const updateTaskPositionSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  position: z.number().int().min(0),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskPositionInput = z.infer<typeof updateTaskPositionSchema>
