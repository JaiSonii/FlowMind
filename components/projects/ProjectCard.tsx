'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MoreVertical, Trash2, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface ProjectCardProps {
  id: string
  name: string
  description?: string
  color: string
  taskCount: number
  completedCount: number
  onDelete?: (id: string) => void
}

export function ProjectCard({
  id,
  name,
  description,
  color,
  taskCount,
  completedCount,
  onDelete,
}: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete?.(id)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

  return (
    <Card className="p-6 border border-border hover:border-indigo-600/50 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${id}/settings`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/projects/${id}`}>
        <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-indigo-600 transition-colors">
          {name}
        </h3>
      </Link>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-semibold text-foreground">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{completedCount} completed</span>
        <span>{taskCount} total tasks</span>
      </div>
    </Card>
  )
}
