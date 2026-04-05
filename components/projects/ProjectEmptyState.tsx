'use client'

import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui.store'

export function ProjectEmptyState() {
  const { setCreateTaskDialogOpen } = useUIStore()
  return (
    <Button
      onClick={() => setCreateTaskDialogOpen(true)}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      Create Your First Task
    </Button>
  )
}