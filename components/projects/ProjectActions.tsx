'use client'

import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui.store'
import Link from 'next/link'

export function ProjectActions({ projectId }: { projectId: string }) {
  const { setCreateTaskDialogOpen, setAIBreakdownDialogOpen } = useUIStore()
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => setAIBreakdownDialogOpen(true)}
        variant="outline"
        className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
      >
        AI Breakdown
      </Button>
      <Button
        onClick={() => setCreateTaskDialogOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        New Task
      </Button>
      <Link href={`/projects/${projectId}/settings`}>
        <Button variant="outline">Settings</Button>
      </Link>
    </div>
  )
}