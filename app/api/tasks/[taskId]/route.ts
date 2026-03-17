import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateTaskSchema, updateTaskPositionSchema } from "@/lib/validations/task"
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

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        createdBy: {
          select: { id: true, name: true, image: true },
        },
        assignee: {
          select: { id: true, name: true, image: true },
        },
        subtasks: {
          include: {
            createdBy: {
              select: { id: true, name: true, image: true },
            },
            assignee: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[GET /api/tasks/:taskId]", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    const { taskId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()

    // Check if this is a position/status update (Kanban drag)
    if (body.status !== undefined && body.position !== undefined) {
      const validatedData = updateTaskPositionSchema.parse(body)
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: validatedData,
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      })
      return NextResponse.json(updatedTask)
    }

    // Regular update
    const validatedData = updateTaskSchema.parse(body)
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: validatedData,
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
        assignee: {
          select: { id: true, name: true, image: true },
        },
        subtasks: {
          include: {
            createdBy: {
              select: { id: true, name: true, image: true },
            },
            assignee: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[PATCH /api/tasks/:taskId]", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    const { taskId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/tasks/:taskId]", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
