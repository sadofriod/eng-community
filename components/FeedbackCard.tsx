import { FeedbackReport, RetryResponse } from "@/types";

interface FeedbackCardProps {
  feedback: FeedbackReport | RetryResponse;
  title?: string;
  delta?: {
    fluency: number;
    accuracy: number;
    vocabulary: number;
    professionalTone: number;
  };
}

export function FeedbackCard({ feedback, title, delta }: FeedbackCardProps) {
  const scores =
    "scores" in feedback ? feedback.scores : feedback;
  const issues = feedback.issues;
  const rewrites = feedback.rewrites;
  const nextFocus = feedback.nextFocus;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}

      {/* Scores */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Dimension Scores
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "fluency", label: "Fluency" },
            { key: "accuracy", label: "Accuracy" },
            { key: "vocabulary", label: "Vocabulary" },
            { key: "professionalTone", label: "Prof. Tone" },
          ].map(({ key, label }) => {
            const score = scores[key as keyof typeof scores];
            const d = delta?.[key as keyof typeof delta];
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-gray-800">
                      {score}
                    </span>
                    {d !== undefined && d !== 0 && (
                      <span
                        className={`text-xs font-medium ${
                          d > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {d > 0 ? `+${d}` : d}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreColor(
                      score
                    )}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Issues */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Issues Found
        </h3>
        <ul className="space-y-2">
          {issues.map((issue, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {issue}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100" />

      {/* Rewrites */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Suggested Rewrites
        </h3>
        <div className="space-y-4">
          {rewrites.map((rw, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-4 space-y-2"
            >
              <div className="text-sm">
                <span className="text-red-500 line-through mr-1">
                  {rw.original}
                </span>
              </div>
              <div className="text-sm font-medium text-green-700">
                → {rw.improved}
              </div>
              <div className="text-xs text-gray-500 italic">{rw.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Next Focus */}
      <div className="px-6 py-4 bg-indigo-50">
        <div className="flex gap-2 items-start">
          <span className="text-lg">🎯</span>
          <div>
            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-0.5">
              Next Practice Focus
            </div>
            <div className="text-sm text-indigo-800">{nextFocus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-400";
  return "bg-red-400";
}
