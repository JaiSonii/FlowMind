'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useUIStore } from '@/store/ui.store'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { StandupSummaryCard } from '@/components/ai/StandupSummaryCard'
import { AIBreakdownDialog } from '@/components/ai/AIBreakdownDialog'
import { Zap } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  position: number
  assigneeId?: string
  dueDate?: Date
}

interface Project {
  id: string
  name: string
  description?: string
  color: string
  tasks: Task[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { 
    createTaskDialogOpen, 
    setCreateTaskDialogOpen,
    aiBreakdownDialogOpen,
    setAIBreakdownDialogOpen 
  } = useUIStore()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center h-96">
        <Spinner className="mr-2" />
        Loading project...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8">
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>

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
      </div>

      <StandupSummaryCard projectId={projectId} />

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        projectId={projectId}
        onCreated={fetchProject}
      />
      
      <AIBreakdownDialog
        open={aiBreakdownDialogOpen}
        onOpenChange={setAIBreakdownDialogOpen}
        projectId={projectId}
        onTasksCreated={fetchProject}
      />

      {/* NEW: Render the Task Detail Dialog here */}
      <TaskDetailDialog onUpdated={fetchProject} />

      {project.tasks.length === 0 ? (
        <Card className="p-8 border border-border text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4 text-lg">No tasks yet</p>
          <Button
            onClick={() => setCreateTaskDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create Your First Task
          </Button>
        </Card>
      ) : (
        <KanbanBoard
          projectId={projectId}
          // @ts-ignore
          tasks={project.tasks}
          onTasksUpdate={fetchProject}
        />
      )}
    </div>
  )
}
