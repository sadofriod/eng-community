import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseQueryParam } from "@/lib/validation";

// Default guest user ID - in production this would come from auth
const DEFAULT_USER_ID = "user_guest";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseQueryParam(searchParams, "limit", 20);

  try {
    const sessions = await prisma.practiceSession.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        scenario: { select: { id: true, title: true, category: true } },
        feedbackReport: {
          select: {
            fluency: true,
            accuracy: true,
            vocabulary: true,
            professionalTone: true,
            nextFocus: true,
          },
        },
        retries: { select: { id: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId } = body;

    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }

    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
    });
    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    const session = await prisma.practiceSession.create({
      data: {
        userId: DEFAULT_USER_ID,
        scenarioId,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
