import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema } from "@/lib/validations/task"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    const { projectId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        parentId: null, // Only top-level tasks
      },
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
      orderBy: {
        position: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[GET /api/projects/:projectId/tasks]", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    const { projectId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse({
      ...body,
      projectId,
    })

    // Get the next position
    const lastTask = await prisma.task.findFirst({
      where: { projectId, parentId: null, status: validatedData.status },
      orderBy: { position: "desc" },
    })

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
        position: (lastTask?.position ?? -1) + 1,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("[POST /api/projects/:projectId/tasks]", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
