import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const [
      holdings,
      analyses,
      macroReports,
      watchlistItems,
      decisions,
      unreadAlertCount,
      topAlerts,
    ] = await Promise.all([
      prisma.holding.findMany({
        where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
      }),
      prisma.companyAnalysis.findMany({
        where: { userId: DEFAULT_USER_ID },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticker: true,
          companyName: true,
          status: true,
          verdict: true,
          moatType: true,
          businessQualityScore: true,
          managementScore: true,
          financialStrengthScore: true,
          valuationScore: true,
          moatDurabilityScore: true,
          researchNotes: true,
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
      prisma.portfolioAlert.count({
        where: { userId: DEFAULT_USER_ID, status: "UNREAD" },
      }),
      prisma.portfolioAlert.findMany({
        where: {
          userId: DEFAULT_USER_ID,
          status: "UNREAD",
          severityLevel: { gte: 2 },
        },
        orderBy: [{ severityLevel: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
    ]);

    const totalValue = holdings.reduce(
      (sum, h) => sum + h.currentValue,
      0
    );
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGainLoss = totalValue - totalCost;

    const latestMacro = macroReports[0] || null;

    const recentAnalyses = analyses.map((a) => {
      const bq = a.businessQualityScore ?? 0;
      const mg = a.managementScore ?? 0;
      const fs = a.financialStrengthScore ?? 0;
      const vl = a.valuationScore ?? 0;
      const md = a.moatDurabilityScore ?? 0;
      const overallScore =
        a.status === "COMPLETE"
          ? bq * 0.25 + mg * 0.15 + fs * 0.2 + vl * 0.25 + md * 0.15
          : null;

      let notesCount = 0;
      if (a.researchNotes) {
        try {
          const notes = JSON.parse(a.researchNotes);
          notesCount = Array.isArray(notes) ? notes.length : 0;
        } catch {
          // ignore
        }
      }

      return {
        id: a.id,
        ticker: a.ticker,
        companyName: a.companyName,
        status: a.status,
        verdict: a.verdict,
        moatType: a.moatType,
        overallScore,
        notesCount,
        createdAt: a.createdAt,
      };
    });

    return NextResponse.json({
      portfolio: {
        totalValue,
        totalCost,
        totalGainLoss,
        holdingCount: holdings.length,
      },
      recentAnalyses,
      latestMacro,
      watchlistCount: watchlistItems.length,
      watchlistItems,
      recentDecisions: decisions,
      alerts: {
        unreadCount: unreadAlertCount,
        items: topAlerts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
