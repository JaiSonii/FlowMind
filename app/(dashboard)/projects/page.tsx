'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProjectCard } from '@/components/projects/ProjectCard'
import Link from 'next/link'
import { FolderPlus } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { Spinner } from '@/components/ui/spinner'

interface Project {
  id: string
  name: string
  description?: string
  color: string
  _count: {
    tasks: number
  }
}

export default function ProjectsPage() {
  const { createProjectDialogOpen, setCreateProjectDialogOpen } = useUIStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  const handleProjectCreated = () => {
    fetchProjects()
    setCreateProjectDialogOpen(false)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage all your projects in one place</p>
        </div>
        <Button
          onClick={() => setCreateProjectDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <FolderPlus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      <CreateProjectDialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen} onCreated={handleProjectCreated} />

      {isLoading ? (
        <Card className="p-8 border border-border">
          <div className="flex items-center justify-center">
            <Spinner className="mr-2 h-4 w-4" />
            <span>Loading projects...</span>
          </div>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="p-8 border border-border text-center">
          <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4 text-lg">No projects yet</p>
          <Button
            onClick={() => setCreateProjectDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create Your First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              color={project.color}
              taskCount={project._count.tasks}
              completedCount={0}
              onDelete={handleProjectDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
