import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_USER_ID = "user_guest";

export async function GET(_request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    // Get all streaks ordered by date desc
    const streaks = await prisma.dailyStreak.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { date: "desc" },
    });

    // Calculate current streak
    let streakDays = 0;
    const checkDate = new Date(today);
    for (const streak of streaks) {
      const streakDate = new Date(streak.date);
      streakDate.setHours(0, 0, 0, 0);
      if (streakDate.getTime() === checkDate.getTime()) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Sessions this week
    const sessionsThisWeek = await prisma.practiceSession.count({
      where: {
        userId: DEFAULT_USER_ID,
        createdAt: { gte: weekAgo },
        status: { in: ["FEEDBACK_DONE", "TRANSCRIBED"] },
      },
    });

    // Retry rate
    const totalSessions = await prisma.practiceSession.count({
      where: {
        userId: DEFAULT_USER_ID,
        status: { in: ["FEEDBACK_DONE", "TRANSCRIBED"] },
      },
    });
    const sessionsWithRetry = await prisma.practiceSession.count({
      where: {
        userId: DEFAULT_USER_ID,
        retries: { some: {} },
      },
    });
    const retryRate =
      totalSessions > 0
        ? Math.round((sessionsWithRetry / totalSessions) * 100)
        : 0;

    // Top weakness tags from recent feedback nextFocus values
    const recentFeedback = await prisma.feedbackReport.findMany({
      where: {
        session: { userId: DEFAULT_USER_ID },
        createdAt: { gte: weekAgo },
      },
      select: { nextFocus: true },
      take: 10,
    });
    const topWeaknessTags = recentFeedback
      .map((f) => f.nextFocus)
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json({
      streakDays,
      sessionsThisWeek,
      retryRate,
      topWeaknessTags,
    });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
