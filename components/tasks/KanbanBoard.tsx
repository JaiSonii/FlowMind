'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { deleteTaskAction, updateTaskStatusAction } from '@/components/tasks/tasks'
import { set } from 'date-fns'
import TrashBin from './Delete'

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
  onTasksUpdate?: () => void
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
  const [localTasks, setLocalTasks] = useState(tasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const[trashActive, setTrashActive] = useState(false)

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  )

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.status]: localTasks
        .filter((t) => t.status === col.status)
        .sort((a, b) => a.position - b.position),
    }),
    {} as Record<TaskStatus, Task[]>
  )

  const handleTaskDrop = useCallback(
    async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
      setIsUpdating(true)
      try {
        await updateTaskStatusAction(
          taskId,
          newStatus,
          newPosition,
          projectId
        )
        onTasksUpdate?.()
      } catch (error) {
        setLocalTasks(tasks) // Revert on failure
      } finally {
        setIsUpdating(false)
      }
    },
    [onTasksUpdate, tasks, projectId]
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    setLocalTasks((prev) => {
      const activeTask = prev.find((t) => t.id === activeId)
      const overTask = prev.find((t) => t.id === overId)

      const activeStatus = activeTask?.status
      const overStatus = overTask
        ? overTask.status
        : COLUMNS.some((col) => col.status === overId) ? (overId as TaskStatus) : null

      if (!activeStatus || !overStatus || activeStatus === overStatus) {
        return prev
      }

      const newTasks = [...prev]
      const taskIndex = newTasks.findIndex((t) => t.id === activeId)

      if (taskIndex > -1) {
        // Optimistically move it to the new column while dragging
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: overStatus }
      }

      return newTasks
    })
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return
      setActiveTask(null)
      setTrashActive(false)

      const activeId = active.id as string
      const overId = over.id as string

      const activeTask = localTasks.find((t) => t.id === activeId)
      if (!activeTask) return

      if (overId === 'trash-bin') {
        deleteTaskAction(activeTask.id, projectId)
        setLocalTasks(localTasks.filter((t) => t.id !== activeId))
        onTasksUpdate?.()
        return
      }

      const currentStatus = activeTask.status
      let newTasks = [...localTasks]

      const statusItems = newTasks
        .filter((t) => t.status === currentStatus)
        .sort((a, b) => a.position - b.position)

      const activeIndex = statusItems.findIndex((t) => t.id === activeId)
      let overIndex = statusItems.findIndex((t) => t.id === overId)

      if (overIndex === -1 && COLUMNS.some((c) => c.status === overId)) {
        overIndex = statusItems.length - 1
      }

      let finalPosition = activeIndex

      if (activeIndex !== overIndex && overIndex !== -1) {
        // Sort array natively based on new indices
        const reorderedItems = arrayMove(statusItems, activeIndex, overIndex)

        reorderedItems.forEach((item, index) => {
          const taskIndex = newTasks.findIndex((t) => t.id === item.id)
          if (taskIndex > -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], position: index }
          }
        })

        finalPosition = overIndex
        setLocalTasks(newTasks)
      }

      const originalTask = tasks.find((t) => t.id === activeId)
      if (
        originalTask &&
        (originalTask.status !== currentStatus || originalTask.position !== finalPosition)
      ) {
        // Persist to database
        handleTaskDrop(activeId, currentStatus, finalPosition)
      }
    },
    [localTasks, tasks, handleTaskDrop]
  )

  const handleDragStart = (e: DragStartEvent) =>{
    const activeId = e.active.id
    setTrashActive(true)
    setActiveTask(localTasks.find((t) => t.id === activeId) || null)
  }

  const handleDragDelete = useCallback(()=>{
    
  }, [])

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={pointerWithin} 
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
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
      <TrashBin active={trashActive}/>
      <DragOverlay>
        {activeTask ? (
          <div className="p-4 border border-border rounded-lg bg-card shadow-lg w-80">
            <h4 className="font-medium text-foreground text-sm line-clamp-2">
              {activeTask.title}
            </h4>
            {activeTask.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {activeTask.description}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}