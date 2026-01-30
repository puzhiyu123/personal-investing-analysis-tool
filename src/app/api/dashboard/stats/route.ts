import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const [holdings, analyses, macroReports, watchlistItems, decisions] =
      await Promise.all([
        prisma.holding.findMany({
          where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
        }),
        prisma.companyAnalysis.findMany({
          where: { userId: DEFAULT_USER_ID },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            ticker: true,
            companyName: true,
            status: true,
            verdict: true,
            createdAt: true,
          },
        }),
        prisma.macroReport.findMany({
          where: { userId: DEFAULT_USER_ID, status: "COMPLETE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            riskLevel: true,
            executiveSummary: true,
            createdAt: true,
          },
        }),
        prisma.watchlistItem.findMany({
          where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.decision.findMany({
          where: { userId: DEFAULT_USER_ID },
          orderBy: { decisionDate: "desc" },
          take: 5,
        }),
      ]);

    const totalValue = holdings.reduce(
      (sum, h) => sum + h.currentValue,
      0
    );
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGainLoss = totalValue - totalCost;

    const latestMacro = macroReports[0] || null;

    return NextResponse.json({
      portfolio: {
        totalValue,
        totalCost,
        totalGainLoss,
        holdingCount: holdings.length,
      },
      recentAnalyses: analyses,
      latestMacro,
      watchlistCount: watchlistItems.length,
      watchlistItems,
      recentDecisions: decisions,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
