import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";

async function getScenarios() {
  try {
    return await prisma.scenario.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
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
    return { streakDays };
  } catch {
    return { streakDays: 0 };
  }
}

export default async function HomePage() {
  const [scenarios, dashboard] = await Promise.all([
    getScenarios(),
    getDashboard(),
  ]);

  const grouped = scenarios.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, typeof scenarios>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workplace English Speaking Coach
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Practice real workplace scenarios with AI feedback. Speak, get
          feedback, improve.
        </p>
        {dashboard.streakDays > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
            🔥 {dashboard.streakDays}-day streak — keep it up!
          </div>
        )}
      </div>

      {/* Scenario Groups */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {CATEGORY_LABELS[category] || category}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((s) => (
              <Link
                key={s.id}
                href={`/practice/${s.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                        CATEGORY_COLORS[s.category] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {CATEGORY_LABELS[s.category] || s.category}
                    </span>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {s.prompt}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0 text-xs text-gray-400 mt-1">
                    ~{s.suggestedMinute}m
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {scenarios.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>No scenarios available. Please run the database seed.</p>
          <p className="text-sm mt-2">
            <code>npx prisma db seed</code>
          </p>
        </div>
      )}
    </div>
  );
}
