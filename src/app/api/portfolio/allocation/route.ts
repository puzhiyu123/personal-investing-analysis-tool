import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ALLOCATION_TYPE_MAP,
  DEFAULT_ALLOCATION_TARGETS,
  parseAllocationTargets,
} from "@/types/portfolio";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
    });

    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    const targets = settings
      ? parseAllocationTargets(settings.allocationTargets)
      : DEFAULT_ALLOCATION_TARGETS;

    // Group holdings by allocation category
    const categoryValues: Record<string, number> = {};
    let totalValue = 0;

    for (const holding of holdings) {
      const category =
        ALLOCATION_TYPE_MAP[holding.assetType] || "other";
      categoryValues[category] =
        (categoryValues[category] || 0) + holding.currentValue;
      totalValue += holding.currentValue;
    }

    // Build allocation entries
    const allocation = Object.entries(targets).map(
      ([category, targetPercent]) => {
        const currentValue = categoryValues[category] || 0;
        const currentPercent =
          totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
        const deviation = currentPercent - targetPercent;

        return {
          assetType: category,
          label:
            category.charAt(0).toUpperCase() + category.slice(1),
          currentPercent: Math.round(currentPercent * 10) / 10,
          targetPercent,
          currentValue,
          deviation: Math.round(deviation * 10) / 10,
        };
      }
    );

    // Build rebalancing suggestions
    const suggestions = allocation
      .filter((a) => Math.abs(a.deviation) > 2)
      .map((a) => ({
        assetType: a.assetType,
        action:
          a.deviation > 0
            ? ("DECREASE" as const)
            : ("INCREASE" as const),
        currentPercent: a.currentPercent,
        targetPercent: a.targetPercent,
        deviation: a.deviation,
        message:
          a.deviation > 0
            ? `${a.label} is ${a.deviation.toFixed(1)}% above target. Consider reducing.`
            : `${a.label} is ${Math.abs(a.deviation).toFixed(1)}% below target. Consider adding.`,
      }));

    return NextResponse.json({
      allocation,
      totalValue,
      suggestions,
    });
  } catch (error) {
    console.error("Error computing allocation:", error);
    return NextResponse.json(
      { error: "Failed to compute allocation" },
      { status: 500 }
    );
  }
}
