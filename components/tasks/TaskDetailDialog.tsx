'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon, Trash2, Plus, GripVertical } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'

interface TaskDetailDialogProps {
    onUpdated: () => void
}

export function TaskDetailDialog({ onUpdated }: TaskDetailDialogProps) {
    const { isTaskDetailOpen, setIsTaskDetailOpen, selectedTaskId, setSelectedTaskId } = useUIStore()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [task, setTask] = useState<any>(null)
    const [subtasks, setSubtasks] = useState<any[]>([])
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

    useEffect(() => {
        if (isTaskDetailOpen && selectedTaskId) {
            fetchTaskDetails()
        } else {
            // Reset state when closed
            setTask(null)
            setSubtasks([])
        }
    }, [isTaskDetailOpen, selectedTaskId])

    const fetchTaskDetails = async () => {
        setIsLoading(true)
        try {
            const [taskRes, subtasksRes] = await Promise.all([
                fetch(`/api/tasks/${selectedTaskId}`),
                fetch(`/api/tasks/${selectedTaskId}/subtasks`)
            ])

            if (taskRes.ok && subtasksRes.ok) {
                setTask(await taskRes.json())
                setSubtasks(await subtasksRes.json())
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateTask = async (field: string, value: any) => {
        setTask((prev: any) => ({ ...prev, [field]: value }))

        try {
            const res = await fetch(`/api/tasks/${selectedTaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            })
            if (res.ok) onUpdated()
        } catch (error) {
            console.error('Failed to update task')
        }
    }

    const handleDeleteTask = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/tasks/${selectedTaskId}`, { method: 'DELETE' })
            if (res.ok) {
                onUpdated()
                handleClose()
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCreateSubtask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubtaskTitle.trim() || isSaving) return
        setIsSaving(true)

        try {
            const res = await fetch(`/api/tasks/${selectedTaskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newSubtaskTitle, priority: 'MEDIUM' }),
            })
            if (res.ok) {
                const newSubtask = await res.json()
                setSubtasks([...subtasks, newSubtask])
                setNewSubtaskTitle('')
                onUpdated()
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE'

        // Optimistic update
        setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, status: newStatus } : st))

        try {
            await fetch(`/api/tasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            onUpdated()
        } catch {
            // Revert on failure
            setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, status: currentStatus } : st))
        }
    }

    const handleDeleteSubtask = async (subtaskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${subtaskId}`, { method: 'DELETE' })
            if (res.ok) {
                setSubtasks(subtasks.filter(st => st.id !== subtaskId))
                onUpdated()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleClose = () => {
        setIsTaskDetailOpen(false)
        setSelectedTaskId(null)
    }

    if (!isTaskDetailOpen) return null

    return (
        <Dialog open={isTaskDetailOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-150 h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Task Details</DialogTitle>
                {isLoading || !task ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Spinner className="w-8 h-8 text-indigo-600" />
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <Input
                                    value={task.title}
                                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                                    onBlur={(e) => handleUpdateTask('title', e.target.value)}
                                    className="text-xl font-bold bg-transparent border-transparent px-0 hover:border-input focus-visible:ring-0 shadow-none h-auto py-1"
                                />
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0" onClick={handleDeleteTask}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Properties */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                    <Select value={task.status} onValueChange={(val) => handleUpdateTask('status', val)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TODO">To Do</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                            <SelectItem value="DONE">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                                    <Select value={task.priority} onValueChange={(val) => handleUpdateTask('priority', val)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-8", !task.dueDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {task.dueDate ? formatDate(new Date(task.dueDate)) : <span>Set date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                                onSelect={(date) => handleUpdateTask('dueDate', date ? date.toISOString() : null)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</span>
                                <Textarea
                                    value={task.description || ''}
                                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                                    onBlur={(e) => handleUpdateTask('description', e.target.value)}
                                    placeholder="Add a more detailed description..."
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Subtasks */}
                            <div className="space-y-3">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subtasks</span>

                                <div className="space-y-2">
                                    {subtasks.map((st) => (
                                        <div key={st.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
                                            <GripVertical className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                            <Checkbox
                                                checked={st.status === 'DONE'}
                                                onCheckedChange={() => handleToggleSubtask(st.id, st.status)}
                                            />
                                            <span className={cn("flex-1 text-sm", st.status === 'DONE' && "line-through text-muted-foreground")}>
                                                {st.title}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                                                onClick={() => handleDeleteSubtask(st.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleCreateSubtask} className="flex gap-2 pt-2">
                                    <Input
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        placeholder="Add a subtask..."
                                        className="h-8"
                                        disabled={isSaving}
                                    />
                                    <Button type="submit" size="sm" variant="secondary" disabled={isSaving || !newSubtaskTitle.trim()}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}