import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}
