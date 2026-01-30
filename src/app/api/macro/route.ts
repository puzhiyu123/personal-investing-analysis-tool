import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { searchPerplexityBatch } from "@/lib/ai/perplexity";
import { generateClaudeJSON } from "@/lib/ai/claude";
import { getDalioQueries } from "@/lib/ai/queries/dalio-queries";
import {
  getDalioSystemPrompt,
  getDalioUserPrompt,
} from "@/lib/ai/prompts/dalio-macro";
import type { DalioMacroResult } from "@/lib/ai/prompts/dalio-macro";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const reports = await prisma.macroReport.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        reportDate: true,
        riskLevel: true,
        executiveSummary: true,
        createdAt: true,
      },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching macro reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch macro reports" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { id: DEFAULT_USER_ID, name: "George" },
      });
    }

    const report = await prisma.macroReport.create({
      data: {
        userId: DEFAULT_USER_ID,
        status: "IN_PROGRESS",
      },
    });

    // Run analysis in background
    runMacroAnalysis(report.id).catch((error) => {
      console.error("Macro analysis failed:", error);
      prisma.macroReport
        .update({
          where: { id: report.id },
          data: { status: "FAILED" },
        })
        .catch(console.error);
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating macro report:", error);
    return NextResponse.json(
      { error: "Failed to create macro report" },
      { status: 500 }
    );
  }
}

async function runMacroAnalysis(reportId: string) {
  // Step 1: Gather data
  const queries = getDalioQueries();
  const perplexityResults = await searchPerplexityBatch(queries, {
    concurrency: 3,
  });

  // Save raw data
  await prisma.macroReport.update({
    where: { id: reportId },
    data: {
      rawData: JSON.stringify(perplexityResults),
    },
  });

  // Step 2: Claude analysis
  const result = await generateClaudeJSON<DalioMacroResult>(
    [
      {
        role: "user",
        content: getDalioUserPrompt(
          perplexityResults.map((r) => ({
            query: r.query,
            content: r.content,
          }))
        ),
      },
    ],
    {
      system: getDalioSystemPrompt(),
      maxTokens: 16384,
      temperature: 0.3,
    }
  );

  // Step 3: Save results (defensive access in case Claude returns unexpected shape)
  const cycles = result.cyclePositions ?? {};
  const ind = result.indicators ?? {};
  const analog = result.historicalAnalog ?? {};

  await prisma.macroReport.update({
    where: { id: reportId },
    data: {
      status: "COMPLETE",

      shortTermDebtCycle: JSON.stringify(cycles.shortTermDebtCycle ?? null),
      longTermDebtCycle: JSON.stringify(cycles.longTermDebtCycle ?? null),
      businessCycle: JSON.stringify(cycles.businessCycle ?? null),

      fedFundsRate: ind.fedFundsRate ?? null,
      yieldCurve: JSON.stringify(ind.yieldCurve ?? null),
      cpiInflation: ind.cpiInflation ?? null,
      pceInflation: ind.pceInflation ?? null,
      unemploymentRate: ind.unemploymentRate ?? null,
      gdpGrowth: ind.gdpGrowth ?? null,
      creditSpreads: JSON.stringify(ind.creditSpreads ?? null),
      m2MoneySupply: JSON.stringify(ind.m2MoneySupply ?? null),

      historicalAnalogPeriod: analog.period ?? null,
      historicalAnalogDescription: analog.description ?? null,
      historicalAnalogSimilarities: JSON.stringify(analog.similarities ?? []),
      historicalAnalogDifferences: JSON.stringify(analog.differences ?? []),

      portfolioImplications: JSON.stringify(result.portfolioImplications ?? []),
      thingsToWatch: JSON.stringify(result.thingsToWatch ?? []),
      riskLevel: result.riskLevel ?? null,

      executiveSummary: result.executiveSummary ?? null,
      fullReport: JSON.stringify(result),
    },
  });
}
