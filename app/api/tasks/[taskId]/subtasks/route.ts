import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema } from "@/lib/validations/task"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    const { taskId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    })

    if (!parentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (parentTask.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const subtasks = await prisma.task.findMany({
      where: { parentId: taskId },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
        assignee: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { position: "asc" },
    })

    return NextResponse.json(subtasks)
  } catch (error) {
    console.error("[GET /api/tasks/:taskId/subtasks]", error)
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    const { taskId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    })

    if (!parentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (parentTask.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse({
      ...body,
      projectId: parentTask.projectId,
    })

    // Get the next position
    const lastSubtask = await prisma.task.findFirst({
      where: { parentId: taskId },
      orderBy: { position: "desc" },
    })

    const subtask = await prisma.task.create({
      data: {
        ...validatedData,
        parentId: taskId,
        createdById: session.user.id,
        position: (lastSubtask?.position ?? -1) + 1,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
        assignee: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("[POST /api/tasks/:taskId/subtasks]", error)
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    )
  }
}
