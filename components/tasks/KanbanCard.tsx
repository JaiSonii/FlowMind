'use client'
import { useUIStore } from '@/store/ui.store'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { TaskStatus } from '@prisma/client'
import { getPriorityColor, getStatusColor, formatDate } from '@/lib/utils'
import { Grip, Calendar, AlertCircle } from 'lucide-react'
import { useState } from 'react'

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

interface KanbanCardProps {
  task: Task
  index: number
  onDrop: (status: TaskStatus) => void
  isUpdating: boolean
  projectId: string
}

export function KanbanCard({ task, index, onDrop, isUpdating, projectId }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const { setIsTaskDetailOpen, setSelectedTaskId } = useUIStore()

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCardClick = () => {
    setSelectedTaskId(task.id)
    setIsTaskDetailOpen(true)
  }

  const isPriority = task.priority === 'HIGH' || task.priority === 'URGENT'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 border border-border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex gap-3 items-start">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 text-muted-foreground/40 hover:text-muted-foreground"
        >
          <Grip className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm line-clamp-2">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </div>
            )}

            {isPriority && (
              <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
