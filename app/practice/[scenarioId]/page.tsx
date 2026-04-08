import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PracticeClient } from "./PracticeClient";

type Props = {
  params: Promise<{ scenarioId: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { scenarioId } = await params;

  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
  });

  if (!scenario) {
    notFound();
  }

  return (
    <PracticeClient
      scenario={{
        id: scenario.id,
        title: scenario.title,
        category: scenario.category,
        prompt: scenario.prompt,
        targetPoints: scenario.targetPoints as string[],
        suggestedMinute: scenario.suggestedMinute,
      }}
    />
  );
}
