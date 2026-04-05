'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { TaskStatus } from '@prisma/client'

async function getSessionUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function createTaskAction(data: { title: string, description?: string, priority: string, projectId: string, dueDate?: string | null }) {
  const userId = await getSessionUserId()
  const maxPosTask = await prisma.task.findFirst({
    where: { projectId: data.projectId, status: 'TODO' },
    orderBy: { position: 'desc' }
  })
  const newPos = maxPosTask ? maxPosTask.position + 1 : 0

  await prisma.task.create({
    data: {
      ...data,
      status: 'TODO',
      priority: data.priority as any,
      position: newPos,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdById: userId,
    }
  })
  revalidatePath(`/projects/${data.projectId}`)
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus, position: number, projectId: string) {
  await getSessionUserId()
  await prisma.task.update({
    where: { id: taskId },
    data: { status, position }
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function updateTaskDetailsAction(taskId: string, data: any, projectId: string) {
  await getSessionUserId()
  if (data.dueDate) data.dueDate = new Date(data.dueDate)
  await prisma.task.update({
    where: { id: taskId },
    data
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  await getSessionUserId()
  await prisma.task.delete({ where: { id: taskId } })
  revalidatePath(`/projects/${projectId}`)
}

export async function getTaskDetailsAction(taskId: string) {
  await getSessionUserId()
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  const subtasks = await prisma.task.findMany({ where: { parentId: taskId }, orderBy: { createdAt: 'asc' } })
  return { task, subtasks }
}

export async function createSubtaskAction(parentId: string, title: string, projectId: string) {
  const userId = await getSessionUserId()
  await prisma.task.create({
    data: {
      title,
      priority: 'MEDIUM',
      parentId,
      projectId,
      createdById: userId
    }
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function toggleSubtaskAction(subtaskId: string, status: string, projectId: string) {
  await getSessionUserId()
  await prisma.task.update({
    where: { id: subtaskId },
    data: { status: status as TaskStatus }
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteSubtaskAction(subtaskId: string, projectId: string) {
  await getSessionUserId()
  await prisma.task.delete({ where: { id: subtaskId } })
  revalidatePath(`/projects/${projectId}`)
}