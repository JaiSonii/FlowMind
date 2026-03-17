'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AIBreakdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onTasksCreated: () => void
}

interface GeneratedSubtask {
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export function AIBreakdownDialog({
  open,
  onOpenChange,
  projectId,
  onTasksCreated,
}: AIBreakdownDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [goal, setGoal] = useState('')
  const [subtasks, setSubtasks] = useState<GeneratedSubtask[]>([])
  const [step, setStep] = useState<'input' | 'result'>('input')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          projectId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate breakdown')
      }

      const data = await response.json()
      setSubtasks(data.subtasks || [])
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTasks = async () => {
    setIsLoading(true)
    try {
      // Create tasks from subtasks
      const taskPromises = subtasks.map((subtask) =>
        fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: subtask.title,
            description: subtask.description,
            priority: subtask.priority,
            projectId,
          }),
        })
      )

      const results = await Promise.all(taskPromises)

      if (results.every((r) => r.ok)) {
        onTasksCreated()
        onOpenChange(false)
        setGoal('')
        setSubtasks([])
        setStep('input')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Task Breakdown
          </DialogTitle>
          <DialogDescription>
            Let AI help break down your goal into actionable tasks.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What's your goal? *
              </label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Build a user authentication system with email and Google OAuth..."
                required
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading || !goal.trim()}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tasks
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Goal:</span> {goal}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Generated Tasks ({subtasks.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {subtasks.map((subtask, idx) => (
                  <Card key={idx} className="p-3 border border-border/50">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {subtask.description}
                          </p>
                        )}
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                            {subtask.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateTasks}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating Tasks...
                  </>
                ) : (
                  'Create Tasks'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
