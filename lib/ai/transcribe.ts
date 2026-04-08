import OpenAI, { toFile } from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.TRANSCRIPTION_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Transcription API key is not configured. Set TRANSCRIPTION_API_KEY or OPENAI_API_KEY."
      );
    }
    _client = new OpenAI({
      apiKey,
      // Use OpenAI for Whisper transcription since DeepSeek doesn't have a Whisper endpoint
      baseURL: process.env.TRANSCRIPTION_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return _client;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  transcript: string;
  segments: TranscriptSegment[];
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<TranscriptionResult> {
  const client = getClient();
  const file = await toFile(audioBuffer, filename, { type: mimeType });

  const response = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments: TranscriptSegment[] = (
    (response as { segments?: Array<{ start: number; end: number; text: string }> }).segments || []
  ).map((seg) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  }));

  return {
    transcript: response.text,
    segments,
  };
}
