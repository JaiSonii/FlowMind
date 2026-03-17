'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { TaskStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'

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

interface KanbanBoardProps {
  projectId: string
  tasks: Task[]
  onTasksUpdate: () => void
}

const COLUMNS = [
  { status: 'TODO' as TaskStatus, title: 'To Do', color: 'bg-slate-400' },
  { status: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', color: 'bg-blue-500' },
  { status: 'IN_REVIEW' as TaskStatus, title: 'In Review', color: 'bg-purple-500' },
  { status: 'DONE' as TaskStatus, title: 'Done', color: 'bg-green-500' },
]

export function KanbanBoard({ projectId, tasks, onTasksUpdate }: KanbanBoardProps) {
  const { setCreateTaskDialogOpen } = useUIStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  )

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.status]: tasks.filter((t) => t.status === col.status),
    }),
    {} as Record<TaskStatus, Task[]>
  )

  const handleTaskDrop = useCallback(
    async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
      setIsUpdating(true)
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            position: newPosition,
          }),
        })

        if (response.ok) {
          onTasksUpdate()
        }
      } finally {
        setIsUpdating(false)
      }
    },
    [onTasksUpdate]
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}>
      <div className="flex h-[calc(100vh-16rem)] min-h-[500px] gap-6 overflow-x-auto pb-4 items-stretch">
        {COLUMNS.map((column) => (
          <div 
            key={column.status} 
            className="flex flex-col shrink-0 w-80 bg-muted/40 dark:bg-muted/10 border border-border/50 rounded-2xl p-4"
          >
            {/* Sticky/Fixed Header inside the column */}
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${column.color}`} />
                <h3 className="font-semibold text-foreground tracking-tight">
                  {column.title}
                </h3>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-background shadow-sm px-2.5 py-0.5 rounded-full">
                {tasksByStatus[column.status]?.length || 0}
              </span>
            </div>

            {/* Scrollable drop zone */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-2 px-2 custom-scrollbar">
              <KanbanColumn
                status={column.status}
                tasks={tasksByStatus[column.status] || []}
                onTaskDrop={handleTaskDrop}
                isUpdating={isUpdating}
                projectId={projectId}
              />
            </div>
          </div>
        ))}

        <div className="shrink-0 w-80">
          <Button
            onClick={() => setCreateTaskDialogOpen(true)}
            variant="ghost"
            className="w-full h-14 border-dashed border-2 border-muted-foreground/20 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-muted-foreground hover:text-indigo-600 rounded-2xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Task
          </Button>
        </div>
      </div>
    </DndContext>
  )
}