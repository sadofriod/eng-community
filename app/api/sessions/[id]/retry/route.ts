import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFeedback } from "@/lib/ai/feedback";
import { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id: sessionId } = await params;

  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      feedbackReport: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  let transcript: string;
  try {
    const body = await request.json();
    transcript = body.transcript || "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!transcript.trim()) {
    return NextResponse.json(
      { error: "Transcript is required" },
      { status: 400 }
    );
  }

  try {
    const feedback = await generateFeedback(
      transcript,
      session.scenario.title,
      session.scenario.prompt,
      session.scenario.targetPoints as string[]
    );

    // Calculate deltas compared to original feedback
    const originalFeedback = session.feedbackReport;
    const deltaFluency = originalFeedback
      ? feedback.scores.fluency - originalFeedback.fluency
      : 0;
    const deltaAccuracy = originalFeedback
      ? feedback.scores.accuracy - originalFeedback.accuracy
      : 0;
    const deltaVocabulary = originalFeedback
      ? feedback.scores.vocabulary - originalFeedback.vocabulary
      : 0;
    const deltaTone = originalFeedback
      ? feedback.scores.professionalTone - originalFeedback.professionalTone
      : 0;

    const retry = await prisma.retryAttempt.create({
      data: {
        sessionId,
        transcript,
        deltaFluency,
        deltaAccuracy,
        deltaVocabulary,
        deltaTone,
        fluency: feedback.scores.fluency,
        accuracy: feedback.scores.accuracy,
        vocabulary: feedback.scores.vocabulary,
        professionalTone: feedback.scores.professionalTone,
        issues: feedback.issues as unknown as Prisma.InputJsonValue,
        rewrites: feedback.rewrites as unknown as Prisma.InputJsonValue,
        nextFocus: feedback.nextFocus,
      },
    });

    return NextResponse.json({
      retryId: retry.id,
      scores: feedback.scores,
      issues: feedback.issues,
      rewrites: feedback.rewrites,
      nextFocus: feedback.nextFocus,
      delta: {
        fluency: deltaFluency,
        accuracy: deltaAccuracy,
        vocabulary: deltaVocabulary,
        professionalTone: deltaTone,
      },
    });
  } catch (error) {
    console.error("Retry feedback failed:", error);
    return NextResponse.json({ error: "FEEDBACK_FAILED" }, { status: 502 });
  }
}
