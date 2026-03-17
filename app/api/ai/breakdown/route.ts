import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { geminiModel } from "@/lib/ai/gemini"
import { generateObject } from "ai"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

const breakdownSchema = z.object({
  subtasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { goal, projectId } = body

    if (!goal || !projectId) {
      return NextResponse.json(
        { error: "Goal and projectId are required" },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { object } = await generateObject({
      model: geminiModel,
      schema: breakdownSchema,
      prompt: `You are an expert project manager. Break down the following goal into specific, actionable subtasks. Each subtask should be clear, measurable, and achievable. Assign appropriate priority levels (LOW, MEDIUM, HIGH, URGENT) based on dependency and importance.

Goal: ${goal}

Return a JSON object with an array of subtasks, each with title, description, and priority.`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("[POST /api/ai/breakdown]", error)
    return NextResponse.json(
      { error: "Failed to generate breakdown" },
      { status: 500 }
    )
  }
}
