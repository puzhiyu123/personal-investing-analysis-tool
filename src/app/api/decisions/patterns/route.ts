import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const decisions = await prisma.decision.findMany({
      where: { userId: DEFAULT_USER_ID },
    });

    const total = decisions.length;
    const byAction: Record<string, number> = {};
    let correct = 0;
    let incorrect = 0;
    let pending = 0;

    for (const d of decisions) {
      byAction[d.action] = (byAction[d.action] || 0) + 1;
      if (d.outcome === "CORRECT") correct++;
      else if (d.outcome === "INCORRECT") incorrect++;
      else pending++;
    }

    const decided = correct + incorrect;
    const accuracy = decided > 0 ? (correct / decided) * 100 : 0;

    return NextResponse.json({
      total,
      byAction,
      correct,
      incorrect,
      pending,
      accuracy: Math.round(accuracy * 10) / 10,
    });
  } catch (error) {
    console.error("Error computing patterns:", error);
    return NextResponse.json(
      { error: "Failed to compute patterns" },
      { status: 500 }
    );
  }
}
