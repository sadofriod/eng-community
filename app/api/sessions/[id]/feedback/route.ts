import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFeedback } from "@/lib/ai/feedback";
import { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id: sessionId } = await params;

  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: { scenario: true },
  });

  if (!session) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  let transcript: string;

  try {
    const body = await request.json();
    const requestedTranscript = body?.transcript;
    const requestedScenarioId = body?.scenarioId;

    // Validate scenarioId if provided — it must match the session's scenario
    if (requestedScenarioId !== undefined && requestedScenarioId !== null) {
      if (typeof requestedScenarioId !== "string") {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
      }
      if (requestedScenarioId !== session.scenarioId) {
        return NextResponse.json({ error: "SCENARIO_ID_MISMATCH" }, { status: 400 });
      }
    }

    if (
      requestedTranscript !== undefined &&
      requestedTranscript !== null &&
      typeof requestedTranscript !== "string"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    transcript =
      typeof requestedTranscript === "string"
        ? requestedTranscript
        : session.transcript || "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!transcript.trim()) {
    return NextResponse.json(
      { error: "Transcript is required" },
      { status: 400 }
    );
  }

  const scenario = session.scenario;

  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { status: "GENERATING_FEEDBACK" },
  });

  try {
    // Persist the final transcript used for feedback (may differ if user edited it)
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { transcript },
    });

    const feedback = await generateFeedback(
      transcript,
      scenario.title,
      scenario.prompt,
      scenario.targetPoints as string[]
    );

    // Upsert feedback report
    await prisma.feedbackReport.upsert({
      where: { sessionId },
      create: {
        sessionId,
        fluency: feedback.scores.fluency,
        accuracy: feedback.scores.accuracy,
        vocabulary: feedback.scores.vocabulary,
        professionalTone: feedback.scores.professionalTone,
        issues: feedback.issues as unknown as Prisma.InputJsonValue,
        rewrites: feedback.rewrites as unknown as Prisma.InputJsonValue,
        nextFocus: feedback.nextFocus,
      },
      update: {
        fluency: feedback.scores.fluency,
        accuracy: feedback.scores.accuracy,
        vocabulary: feedback.scores.vocabulary,
        professionalTone: feedback.scores.professionalTone,
        issues: feedback.issues as unknown as Prisma.InputJsonValue,
        rewrites: feedback.rewrites as unknown as Prisma.InputJsonValue,
        nextFocus: feedback.nextFocus,
      },
    });

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { status: "FEEDBACK_DONE" },
    });

    // Record daily streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyStreak.upsert({
      where: { userId_date: { userId: session.userId, date: today } },
      create: { userId: session.userId, date: today },
      update: {},
    });

    return NextResponse.json({
      scores: feedback.scores,
      issues: feedback.issues,
      rewrites: feedback.rewrites,
      nextFocus: feedback.nextFocus,
    });
  } catch (error) {
    console.error("Feedback generation failed:", error);
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { status: "FEEDBACK_FAILED" },
    });
    const errorMessage =
      error instanceof Error ? error.message : "FEEDBACK_FAILED";
    if (errorMessage === "INVALID_FEEDBACK_FORMAT") {
      return NextResponse.json(
        { error: "INVALID_FEEDBACK_FORMAT" },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "FEEDBACK_FAILED" }, { status: 502 });
  }
}
