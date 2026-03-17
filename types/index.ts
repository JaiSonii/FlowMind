import { Session } from "next-auth"

export interface ExtendedSession extends Session {
  user: Session["user"] & {
    id: string
  }
}

export interface TaskWithRelations {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate: Date | null
  position: number
  createdAt: Date
  updatedAt: Date
  projectId: string
  createdById: string
  assigneeId: string | null
  parentId: string | null
  aiGenerated: boolean
  createdBy?: {
    id: string
    name: string | null
    image: string | null
  }
  assignee?: {
    id: string
    name: string | null
    image: string | null
  }
  subtasks?: TaskWithRelations[]
}

export interface ProjectWithStats {
  id: string
  name: string
  description: string | null
  color: string
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED"
  createdAt: Date
  updatedAt: Date
  userId: string
  taskCount?: number
  completedCount?: number
}
