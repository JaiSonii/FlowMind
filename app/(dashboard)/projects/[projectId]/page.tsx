import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { Card } from '@/components/ui/card'
import { StandupSummaryCard } from '@/components/ai/StandupSummaryCard'
import { Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectActions } from '@/components/projects/ProjectActions'
import { ProjectEmptyState } from '@/components/projects/ProjectEmptyState'
import { ProjectDialogs } from '@/components/projects/ProjectDialogs'

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: { orderBy: { position: 'asc' } } }
  })

  if (!project) {
    notFound()
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

        <ProjectActions projectId={projectId} />
      </div>

      <StandupSummaryCard projectId={projectId} />

      {/* Client Dialogs Wrapper */}
      <ProjectDialogs projectId={projectId} />
      
      {project.tasks.length === 0 ? (
        <Card className="p-8 border border-border text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4 text-lg">No tasks yet</p>
          <ProjectEmptyState />
        </Card>
      ) : (
        <KanbanBoard
          projectId={projectId}
          // @ts-ignore
          tasks={project.tasks}
        />
      )}
    </div>
  )
}
