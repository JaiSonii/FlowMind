import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { geminiModel } from "@/lib/ai/gemini"
import { generateText } from "ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get tasks for the project
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { name: true },
        },
      },
    })

    const taskSummary = tasks
      .map(
        (task) =>
          `- [${task.status}] ${task.title} (Priority: ${task.priority}, Assigned to: ${task.assignee?.name || "Unassigned"})`
      )
      .join("\n")

    const { text } = await generateText({
      model: geminiModel,
      prompt: `You are a skilled project manager creating a daily standup summary. Based on the following project tasks and their statuses, generate a concise and motivating standup summary that highlights progress, blockers, and next steps.

Project: ${project.name}

Tasks:
${taskSummary}

Please provide a 2-3 paragraph standup summary that includes:
1. Completed work and progress made
2. Current work in progress
3. Any blockers or risks
4. Next steps and priorities`,
    })

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("[POST /api/ai/standup]", error)
    return NextResponse.json(
      { error: "Failed to generate standup summary" },
      { status: 500 }
    )
  }
}
