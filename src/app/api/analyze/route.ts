import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { searchPerplexityBatch } from "@/lib/ai/perplexity";
import { generateClaudeJSON } from "@/lib/ai/claude";
import { getBuffettQueries } from "@/lib/ai/queries/buffett-queries";
import {
  getBuffettSystemPrompt,
  getBuffettUserPrompt,
} from "@/lib/ai/prompts/buffett-analysis";
import type { BuffettAnalysisResult } from "@/lib/ai/prompts/buffett-analysis";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const analyses = await prisma.companyAnalysis.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticker: true,
        companyName: true,
        status: true,
        verdict: true,
        executiveSummary: true,
        businessQualityScore: true,
        managementScore: true,
        financialStrengthScore: true,
        valuationScore: true,
        moatDurabilityScore: true,
        moatType: true,
        moatScore: true,
        aiDisruptionLevel: true,
        createdAt: true,
      },
    });
    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "ticker is required" },
        { status: 400 }
      );
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { id: DEFAULT_USER_ID, name: "George" },
      });
    }

    // Create analysis record
    const analysis = await prisma.companyAnalysis.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: ticker.toUpperCase(),
        status: "IN_PROGRESS",
      },
    });

    // Run analysis in background (non-blocking)
    runAnalysis(analysis.id, ticker.toUpperCase()).catch((error) => {
      console.error("Analysis failed:", error);
      prisma.companyAnalysis
        .update({
          where: { id: analysis.id },
          data: { status: "FAILED" },
        })
        .catch(console.error);
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 }
    );
  }
}

async function runAnalysis(analysisId: string, ticker: string) {
  // Step 1: Gather data from Perplexity
  const queries = getBuffettQueries(ticker);
  const perplexityResults = await searchPerplexityBatch(queries, {
    concurrency: 3,
  });

  // Save raw Perplexity data
  await prisma.companyAnalysis.update({
    where: { id: analysisId },
    data: {
      rawPerplexityData: JSON.stringify(perplexityResults),
    },
  });

  // Step 2: Send to Claude for analysis
  const result = await generateClaudeJSON<BuffettAnalysisResult>(
    [
      {
        role: "user",
        content: getBuffettUserPrompt(
          ticker,
          perplexityResults.map((r) => ({
            query: r.query,
            content: r.content,
          }))
        ),
      },
    ],
    {
      system: getBuffettSystemPrompt(),
      maxTokens: 16384,
      temperature: 0.3,
    }
  );

  // Step 3: Save results
  await prisma.companyAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "COMPLETE",
      companyName: result.companyName || ticker,

      // Financials
      revenueGrowth: JSON.stringify(result.financials.revenueGrowth),
      ownerEarnings: JSON.stringify(result.financials.ownerEarnings),
      margins: JSON.stringify(result.financials.margins),
      roic: JSON.stringify(result.financials.roic),
      debtToEquity: result.financials.debtToEquity,
      freeCashFlow: JSON.stringify(result.financials.freeCashFlow),

      // Moat
      moatType: result.moat.type,
      moatScore: result.moat.score,
      moatEvidence: JSON.stringify(result.moat.evidence),
      moatThreats: JSON.stringify(result.moat.threats),

      // AI Disruption
      aiDisruptionLevel: result.aiDisruption.level,
      aiDisruptionScore: result.aiDisruption.score,
      aiDisruptionAnalysis: result.aiDisruption.analysis,

      // Scores
      businessQualityScore: result.scores.businessQuality,
      managementScore: result.scores.management,
      financialStrengthScore: result.scores.financialStrength,
      valuationScore: result.scores.valuation,
      moatDurabilityScore: result.scores.moatDurability,

      // Questions
      generatedQuestions: JSON.stringify(result.generatedQuestions),

      // Verdict
      verdict: result.verdict,
      verdictReasoning: result.verdictReasoning,
      executiveSummary: result.executiveSummary,
      keyRisks: JSON.stringify(result.keyRisks),
      keyCatalysts: JSON.stringify(result.keyCatalysts),

      rawClaudeResponse: JSON.stringify(result),
    },
  });
}
