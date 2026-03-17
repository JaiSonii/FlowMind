'use client'

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskStatus } from '@prisma/client'
import { KanbanCard } from './KanbanCard'

interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: string
  position: number
  assigneeId?: string
  dueDate?: Date
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskDrop: (taskId: string, newStatus: TaskStatus, newPosition: number) => void
  isUpdating: boolean
  projectId: string
}

export function KanbanColumn({
  status,
  tasks,
  onTaskDrop,
  isUpdating,
  projectId,
}: KanbanColumnProps) {
  const taskIds = tasks.map((t) => t.id)

  return (
    <div className="flex flex-col gap-3 min-h-full h-full pb-4">
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {tasks.map((task, index) => (
          <KanbanCard
            key={task.id}
            task={task}
            index={index}
            onDrop={(newStatus) => onTaskDrop(task.id, newStatus, index)}
            isUpdating={isUpdating}
            projectId={projectId}
          />
        ))}
      </SortableContext>
      
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-xl bg-background/50 text-muted-foreground/50 text-sm font-medium">
          Drop here
        </div>
      )}
    </div>
  )
}