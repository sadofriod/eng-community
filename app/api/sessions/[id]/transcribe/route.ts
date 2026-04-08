import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { transcribeAudio } from "@/lib/ai/transcribe";

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_AUDIO" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "INVALID_AUDIO" }, { status: 400 });
  }

  // Update session status to transcribing
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { status: "TRANSCRIBING" },
  });

  try {
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const mimeType = audioFile.type || "audio/webm";
    const filename = audioFile.name || `audio_${sessionId}.webm`;

    const result = await transcribeAudio(buffer, filename, mimeType);

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        transcript: result.transcript,
        status: "TRANSCRIBED",
      },
    });

    return NextResponse.json({
      sessionId,
      transcript: result.transcript,
      segments: result.segments,
    });
  } catch (error) {
    console.error("Transcription failed:", error);
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { status: "TRANSCRIBE_FAILED" },
    });
    return NextResponse.json({ error: "TRANSCRIBE_FAILED" }, { status: 502 });
  }
}
