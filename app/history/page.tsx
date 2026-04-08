import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";

async function getSessions() {
  try {
    return await prisma.practiceSession.findMany({
      where: { userId: "user_guest" },
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
        retries: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch {
    return [];
  }
}

async function getDashboard() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streaks = await prisma.dailyStreak.findMany({
      where: { userId: "user_guest" },
      orderBy: { date: "desc" },
    });

    let streakDays = 0;
    const checkDate = new Date(today);
    for (const streak of streaks) {
      const d = new Date(streak.date);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === checkDate.getTime()) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const sessionsThisWeek = await prisma.practiceSession.count({
      where: {
        userId: "user_guest",
        createdAt: { gte: weekAgo },
        status: { in: ["FEEDBACK_DONE", "TRANSCRIBED"] },
      },
    });

    const totalSessions = await prisma.practiceSession.count({
      where: {
        userId: "user_guest",
        status: { in: ["FEEDBACK_DONE", "TRANSCRIBED"] },
      },
    });
    const sessionsWithRetry = await prisma.practiceSession.count({
      where: { userId: "user_guest", retries: { some: {} } },
    });
    const retryRate =
      totalSessions > 0
        ? Math.round((sessionsWithRetry / totalSessions) * 100)
        : 0;

    return { streakDays, sessionsThisWeek, retryRate };
  } catch {
    return { streakDays: 0, sessionsThisWeek: 0, retryRate: 0 };
  }
}

function avgScore(fb: {
  fluency: number;
  accuracy: number;
  vocabulary: number;
  professionalTone: number;
}) {
  return Math.round(
    (fb.fluency + fb.accuracy + fb.vocabulary + fb.professionalTone) / 4
  );
}

export default async function HistoryPage() {
  const [sessions, dashboard] = await Promise.all([
    getSessions(),
    getDashboard(),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Practice History
      </h1>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-orange-500">
            {dashboard.streakDays}
          </div>
          <div className="text-sm text-gray-500 mt-1">Day Streak 🔥</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-indigo-600">
            {dashboard.sessionsThisWeek}
          </div>
          <div className="text-sm text-gray-500 mt-1">Sessions This Week</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-green-600">
            {dashboard.retryRate}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Retry Rate</div>
        </div>
      </div>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-3">No sessions yet</p>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Start practicing →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        CATEGORY_COLORS[session.scenario.category] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {CATEGORY_LABELS[session.scenario.category] ||
                        session.scenario.category}
                    </span>
                    {session.retries.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Retried
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {session.scenario.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                  {session.feedbackReport && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Next focus: {session.feedbackReport.nextFocus}
                    </p>
                  )}
                </div>

                {session.feedbackReport && (
                  <div className="flex-shrink-0 text-center">
                    <div
                      className={`text-2xl font-bold ${scoreTextColor(
                        avgScore(session.feedbackReport)
                      )}`}
                    >
                      {avgScore(session.feedbackReport)}
                    </div>
                    <div className="text-xs text-gray-400">avg score</div>
                  </div>
                )}
              </div>

              {session.transcript && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {session.transcript}
                  </p>
                </div>
              )}

              <div className="mt-3 flex justify-end">
                <Link
                  href={`/practice/${session.scenario.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Practice again →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}
