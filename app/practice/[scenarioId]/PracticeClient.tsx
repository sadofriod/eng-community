"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioRecorder } from "@/components/AudioRecorder";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Scenario, ApiFeedbackResponse, RetryResponse } from "@/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";

type Phase =
  | "ready"
  | "uploading"
  | "transcribing"
  | "review_transcript"
  | "generating_feedback"
  | "feedback"
  | "retry_recording"
  | "retry_uploading"
  | "retry_feedback"
  | "complete";

interface PracticeClientProps {
  scenario: Scenario;
}

export function PracticeClient({ scenario }: PracticeClientProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<ApiFeedbackResponse | null>(null);
  const [retryTranscript, setRetryTranscript] = useState("");
  const [retryFeedback, setRetryFeedback] = useState<RetryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFirstRecording = async (blob: Blob) => {
    setError(null);
    setPhase("uploading");

    try {
      // Create session
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id }),
      });
      if (!sessionRes.ok) throw new Error("Failed to create session");
      const { sessionId: sid } = await sessionRes.json();
      setSessionId(sid);

      // Transcribe
      setPhase("transcribing");
      const formData = new FormData();
      formData.append("audio", blob, `recording_${sid}.webm`);

      const transcribeRes = await fetch(
        `/api/sessions/${sid}/transcribe`,
        { method: "POST", body: formData }
      );
      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error || "Transcription failed");
      }
      const { transcript: t } = await transcribeRes.json();
      setTranscript(t);
      setPhase("review_transcript");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setPhase("ready");
    }
  };

  const handleGetFeedback = async () => {
    if (!sessionId) return;
    setError(null);
    setPhase("generating_feedback");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, scenarioId: scenario.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Feedback generation failed");
      }
      const fb = await res.json();
      setFeedback(fb);
      setPhase("feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setPhase("review_transcript");
    }
  };

  const handleRetryRecording = async (blob: Blob) => {
    if (!sessionId) return;
    setError(null);
    setPhase("retry_uploading");

    try {
      // Send audio directly to /retry — it transcribes internally without
      // overwriting the original session transcript
      const formData = new FormData();
      formData.append("audio", blob, `retry_${sessionId}.webm`);

      const retryRes = await fetch(`/api/sessions/${sessionId}/retry`, {
        method: "POST",
        body: formData,
      });
      if (!retryRes.ok) {
        const err = await retryRes.json();
        throw new Error(err.error || "Retry failed");
      }
      const rf = await retryRes.json();
      setRetryTranscript(rf.transcript || "");
      setRetryFeedback(rf);
      setPhase("retry_feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setPhase("feedback");
    }
  };

  const isLoading = [
    "uploading",
    "transcribing",
    "generating_feedback",
    "retry_uploading",
  ].includes(phase);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to Scenarios
      </Link>

      {/* Scenario Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            CATEGORY_COLORS[scenario.category] || "bg-gray-100 text-gray-600"
          }`}
        >
          {CATEGORY_LABELS[scenario.category] || scenario.category}
        </span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {scenario.title}
        </h1>
        <p className="text-gray-600 mb-4">{scenario.prompt}</p>
        <div className="flex flex-wrap gap-2">
          {scenario.targetPoints.map((pt, i) => (
            <span
              key={i}
              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
            >
              ✓ {pt}
            </span>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Phase: Ready - First Recording */}
      {(phase === "ready" || phase === "uploading" || phase === "transcribing") && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Round 1 — Speak Your Response
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Take ~{scenario.suggestedMinute} minutes. Aim for the target
            expression points above.
          </p>
          {isLoading ? (
            <LoadingIndicator phase={phase} />
          ) : (
            <AudioRecorder
              onRecordingComplete={handleFirstRecording}
              disabled={isLoading}
            />
          )}
        </div>
      )}

      {/* Phase: Review Transcript */}
      {phase === "review_transcript" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Transcript
          </h2>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full min-h-[120px] p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            placeholder="Your transcript will appear here. You can edit it before getting feedback."
          />
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => setPhase("ready")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
            >
              Re-record
            </button>
            <button
              onClick={handleGetFeedback}
              disabled={!transcript.trim()}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-full"
            >
              Get AI Feedback →
            </button>
          </div>
        </div>
      )}

      {/* Phase: Generating Feedback */}
      {phase === "generating_feedback" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <LoadingIndicator phase={phase} />
        </div>
      )}

      {/* Phase: Feedback */}
      {(phase === "feedback" || phase === "retry_recording" || phase === "retry_uploading") &&
        feedback && (
          <div className="space-y-6">
            <FeedbackCard feedback={feedback} title="Round 1 Feedback" />

            {/* Retry section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Round 2 — Practice Again
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Apply the feedback and try again to see your improvement.
              </p>
              {phase === "retry_uploading" ? (
                <LoadingIndicator phase={phase} />
              ) : (
                <AudioRecorder
                  onRecordingComplete={handleRetryRecording}
                  disabled={false}
                />
              )}
            </div>

            <div className="text-center">
              <Link
                href="/history"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip retry → View History
              </Link>
            </div>
          </div>
        )}

      {/* Phase: Retry Feedback */}
      {phase === "retry_feedback" && feedback && retryFeedback && (
        <div className="space-y-6">
          <FeedbackCard feedback={feedback} title="Round 1 Feedback" />

          <div className="bg-indigo-50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-indigo-700 mb-2">
              Your Round 2 Transcript
            </h3>
            <p className="text-sm text-indigo-900">{retryTranscript}</p>
          </div>

          <FeedbackCard
            feedback={retryFeedback}
            title="Round 2 Feedback"
            delta={retryFeedback.delta}
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-gray-500 mb-4">Great work! Session complete.</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full text-sm"
              >
                Practice Another Scenario
              </Link>
              <Link
                href="/history"
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-sm"
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingIndicator({ phase }: { phase: string }) {
  const messages: Record<string, string> = {
    uploading: "Uploading audio…",
    transcribing: "Transcribing your speech…",
    generating_feedback: "Generating AI feedback…",
    retry_uploading: "Processing retry…",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{messages[phase] || "Loading…"}</p>
    </div>
  );
}
