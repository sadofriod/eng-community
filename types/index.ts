export interface Scenario {
  id: string;
  category: string;
  title: string;
  prompt: string;
  targetPoints: string[];
  suggestedMinute: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  scenarioId: string;
  status: string;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  scenario?: {
    id: string;
    title: string;
    category: string;
  };
  feedbackReport?: FeedbackReport | null;
  retries?: RetryAttempt[];
}

export interface FeedbackScores {
  fluency: number;
  accuracy: number;
  vocabulary: number;
  professionalTone: number;
}

/** Shape returned by POST /api/sessions/:id/feedback */
export interface ApiFeedbackResponse {
  scores: FeedbackScores;
  issues: string[];
  rewrites: RewriteSuggestion[];
  nextFocus: string;
}

/** Flat shape used in history/session records from the DB */
export interface FeedbackReport {
  fluency: number;
  accuracy: number;
  vocabulary: number;
  professionalTone: number;
  issues: string[];
  rewrites: RewriteSuggestion[];
  nextFocus: string;
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
  why: string;
}

export interface RetryAttempt {
  id: string;
  sessionId: string;
  transcript: string;
  deltaFluency: number;
  deltaAccuracy: number;
  deltaVocabulary: number;
  deltaTone: number;
  fluency: number;
  accuracy: number;
  vocabulary: number;
  professionalTone: number;
  issues: string[];
  rewrites: RewriteSuggestion[];
  nextFocus: string;
  createdAt: string;
}

export interface RetryResponse {
  retryId: string;
  scores: {
    fluency: number;
    accuracy: number;
    vocabulary: number;
    professionalTone: number;
  };
  issues: string[];
  rewrites: RewriteSuggestion[];
  nextFocus: string;
  delta: {
    fluency: number;
    accuracy: number;
    vocabulary: number;
    professionalTone: number;
  };
}

export interface DashboardData {
  streakDays: number;
  sessionsThisWeek: number;
  retryRate: number;
  topWeaknessTags: string[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  "self-introduction": "Self Introduction",
  "meeting-update": "Meeting Update",
  "suggestion-disagreement": "Suggestion & Disagreement",
  "cross-team": "Cross-team Collaboration",
  "interview-career": "Interview & Career",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "self-introduction": "bg-blue-100 text-blue-700",
  "meeting-update": "bg-green-100 text-green-700",
  "suggestion-disagreement": "bg-yellow-100 text-yellow-700",
  "cross-team": "bg-purple-100 text-purple-700",
  "interview-career": "bg-red-100 text-red-700",
};
