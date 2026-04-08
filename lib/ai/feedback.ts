import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export interface FeedbackScores {
  fluency: number;
  accuracy: number;
  vocabulary: number;
  professionalTone: number;
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
  why: string;
}

export interface FeedbackResult {
  scores: FeedbackScores;
  issues: string[];
  rewrites: RewriteSuggestion[];
  nextFocus: string;
}

const FEEDBACK_SYSTEM_PROMPT = `You are an expert English speaking coach specializing in workplace communication.
Evaluate the user's spoken English transcript and provide structured feedback.

You MUST respond with ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "scores": {
    "fluency": <integer 0-100>,
    "accuracy": <integer 0-100>,
    "vocabulary": <integer 0-100>,
    "professionalTone": <integer 0-100>
  },
  "issues": [
    "<issue 1: specific problem found in the transcript>",
    "<issue 2>",
    "<issue 3>"
  ],
  "rewrites": [
    {
      "original": "<exact phrase from transcript>",
      "improved": "<better alternative>",
      "why": "<brief explanation>"
    },
    { "original": "...", "improved": "...", "why": "..." },
    { "original": "...", "improved": "...", "why": "..." }
  ],
  "nextFocus": "<one specific thing to practice next time>"
}

Scoring rubric:
- fluency: natural flow, pace, filler word usage
- accuracy: grammar, syntax, word form correctness  
- vocabulary: word variety, precision, avoidance of repetition
- professionalTone: workplace appropriateness, formality level, politeness

Always provide exactly 3 issues and 3 rewrites. Be specific and actionable.`;

export async function generateFeedback(
  transcript: string,
  scenarioTitle: string,
  scenarioPrompt: string,
  targetPoints: string[]
): Promise<FeedbackResult> {
  const userMessage = `Scenario: ${scenarioTitle}
Context: ${scenarioPrompt}
Target expression points: ${targetPoints.join(", ")}

User's transcript:
"""
${transcript}
"""

Please evaluate this transcript and provide structured feedback.`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: FEEDBACK_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("INVALID_FEEDBACK_FORMAT");
  }

  try {
    const parsed = JSON.parse(content) as FeedbackResult;
    // Validate required fields
    if (
      !parsed.scores ||
      !Array.isArray(parsed.issues) ||
      !Array.isArray(parsed.rewrites) ||
      !parsed.nextFocus
    ) {
      throw new Error("Missing required fields");
    }
    return parsed;
  } catch {
    throw new Error("INVALID_FEEDBACK_FORMAT");
  }
}
