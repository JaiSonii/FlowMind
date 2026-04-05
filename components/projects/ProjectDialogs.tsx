'use client'

import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { AIBreakdownDialog } from '@/components/ai/AIBreakdownDialog'
import { useUIStore } from '@/store/ui.store'

export function ProjectDialogs({ projectId }: { projectId: string }) {
  const {
    createTaskDialogOpen,
    setCreateTaskDialogOpen,
    aiBreakdownDialogOpen,
    setAIBreakdownDialogOpen
  } = useUIStore()

  return (
    <>
      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        projectId={projectId}
      />
      <AIBreakdownDialog
        open={aiBreakdownDialogOpen}
        onOpenChange={setAIBreakdownDialogOpen}
        projectId={projectId}
        onTasksCreated={() => {}}
      />
      <TaskDetailDialog projectId={projectId} />
    </>
  )
}