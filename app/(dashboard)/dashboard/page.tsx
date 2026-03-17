import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FolderPlus, CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react'

async function loadProjects(userId: string) {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('[v0] DATABASE_URL not set, skipping database query')
      return { projects: [], tasks: [] }
    }

    const { prisma } = await import('@/lib/prisma')
    
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { tasks: true } },
      },
      take: 5,
    })

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          userId,
        },
      },
    })

    return { projects, tasks }
  } catch (error) {
    console.log('[v0] Database error on dashboard:', error)
    return { projects: [], tasks: [] }
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const { projects, tasks } = await loadProjects(session.user.id)
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const totalTasks = tasks.length
  const databaseNotConfigured = !process.env.DATABASE_URL

  return (
    <div className="p-6 md:p-8">
      {databaseNotConfigured && (
        <Card className="p-4 mb-6 bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Database Not Configured</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Please set the DATABASE_URL environment variable to enable data persistence. Check the README for setup instructions.
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalTasks}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-indigo-600/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">{inProgressTasks}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-600/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completedTasks}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-600/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">{projects.length}</p>
            </div>
            <FolderPlus className="w-12 h-12 text-purple-600/20" />
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="p-8 border border-border text-center">
            <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link href="/projects/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Create Your First Project</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="p-6 border border-border hover:border-indigo-600/50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {project._count.tasks} tasks
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
