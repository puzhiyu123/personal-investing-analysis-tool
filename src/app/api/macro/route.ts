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

  // Step 3: Save results
  await prisma.macroReport.update({
    where: { id: reportId },
    data: {
      status: "COMPLETE",

      shortTermDebtCycle: JSON.stringify(
        result.cyclePositions.shortTermDebtCycle
      ),
      longTermDebtCycle: JSON.stringify(
        result.cyclePositions.longTermDebtCycle
      ),
      businessCycle: JSON.stringify(result.cyclePositions.businessCycle),

      fedFundsRate: result.indicators.fedFundsRate,
      yieldCurve: JSON.stringify(result.indicators.yieldCurve),
      cpiInflation: result.indicators.cpiInflation,
      pceInflation: result.indicators.pceInflation,
      unemploymentRate: result.indicators.unemploymentRate,
      gdpGrowth: result.indicators.gdpGrowth,
      creditSpreads: JSON.stringify(result.indicators.creditSpreads),
      m2MoneySupply: JSON.stringify(result.indicators.m2MoneySupply),

      historicalAnalogPeriod: result.historicalAnalog.period,
      historicalAnalogDescription: result.historicalAnalog.description,
      historicalAnalogSimilarities: JSON.stringify(
        result.historicalAnalog.similarities
      ),
      historicalAnalogDifferences: JSON.stringify(
        result.historicalAnalog.differences
      ),

      portfolioImplications: JSON.stringify(result.portfolioImplications),
      thingsToWatch: JSON.stringify(result.thingsToWatch),
      riskLevel: result.riskLevel,

      executiveSummary: result.executiveSummary,
      fullReport: JSON.stringify(result),
    },
  });
}
