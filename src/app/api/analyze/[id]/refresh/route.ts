import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateClaudeJSON } from "@/lib/ai/claude";
import {
  getBuffettSystemPrompt,
  getBuffettUserPrompt,
} from "@/lib/ai/prompts/buffett-analysis";
import type { BuffettAnalysisResult } from "@/lib/ai/prompts/buffett-analysis";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.companyAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (analysis.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Analysis is still in progress" },
        { status: 409 }
      );
    }

    if (!analysis.rawPerplexityData) {
      return NextResponse.json(
        { error: "No research data available to re-analyze" },
        { status: 400 }
      );
    }

    // Set status to UPDATING
    await prisma.companyAnalysis.update({
      where: { id },
      data: { status: "UPDATING" },
    });

    // Fire-and-forget the refresh
    refreshAnalysis(id).catch((error) => {
      console.error("Refresh analysis failed:", error);
      // Revert to COMPLETE on error — preserve existing analysis
      prisma.companyAnalysis
        .update({
          where: { id },
          data: { status: "COMPLETE" },
        })
        .catch(console.error);
    });

    return NextResponse.json({ status: "UPDATING" });
  } catch (error) {
    console.error("Error triggering refresh:", error);
    return NextResponse.json(
      { error: "Failed to trigger refresh" },
      { status: 500 }
    );
  }
}

async function refreshAnalysis(analysisId: string) {
  const analysis = await prisma.companyAnalysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis || !analysis.rawPerplexityData) {
    throw new Error("Analysis or Perplexity data not found");
  }

  // Parse stored data
  const perplexityResults = JSON.parse(analysis.rawPerplexityData) as Array<{
    query: string;
    content: string;
  }>;

  const researchNotes = analysis.researchNotes
    ? (JSON.parse(analysis.researchNotes) as Array<{
        id: string;
        content: string;
        createdAt: string;
      }>)
    : undefined;

  const existingQuestions = analysis.generatedQuestions
    ? (JSON.parse(analysis.generatedQuestions) as Array<{
        question: string;
        category: string;
        answered: boolean;
      }>)
    : undefined;

  // Re-run Claude analysis with notes and existing questions included
  const result = await generateClaudeJSON<BuffettAnalysisResult>(
    [
      {
        role: "user",
        content: getBuffettUserPrompt(
          analysis.ticker,
          perplexityResults.map((r) => ({
            query: r.query,
            content: r.content,
          })),
          researchNotes,
          existingQuestions
        ),
      },
    ],
    {
      system: getBuffettSystemPrompt(),
      maxTokens: 16384,
      temperature: 0.3,
    }
  );

  // Save results (same save logic as runAnalysis)
  const fin = result.financials ?? {};
  const moat = result.moat ?? {};
  const ai = result.aiDisruption ?? {};
  const scores = result.scores ?? {};

  await prisma.companyAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "COMPLETE",
      companyName: result.companyName || analysis.ticker,

      // Financials
      revenueGrowth: JSON.stringify(fin.revenueGrowth ?? null),
      ownerEarnings: JSON.stringify(fin.ownerEarnings ?? null),
      margins: JSON.stringify(fin.margins ?? null),
      roic: JSON.stringify(fin.roic ?? null),
      debtToEquity: fin.debtToEquity ?? null,
      freeCashFlow: JSON.stringify(fin.freeCashFlow ?? null),

      // Moat
      moatType: moat.type ?? null,
      moatScore: moat.score ?? null,
      moatEvidence: JSON.stringify(moat.evidence ?? []),
      moatThreats: JSON.stringify(moat.threats ?? []),

      // AI Disruption
      aiDisruptionLevel: ai.level ?? null,
      aiDisruptionScore: ai.score ?? null,
      aiDisruptionAnalysis: ai.analysis ?? null,

      // Scores
      businessQualityScore: scores.businessQuality ?? null,
      managementScore: scores.management ?? null,
      financialStrengthScore: scores.financialStrength ?? null,
      valuationScore: scores.valuation ?? null,
      moatDurabilityScore: scores.moatDurability ?? null,

      // Questions
      generatedQuestions: JSON.stringify(result.generatedQuestions ?? []),

      // Verdict
      verdict: result.verdict ?? null,
      verdictReasoning: result.verdictReasoning ?? null,
      executiveSummary: result.executiveSummary ?? null,
      keyRisks: JSON.stringify(result.keyRisks ?? []),
      keyCatalysts: JSON.stringify(result.keyCatalysts ?? []),

      rawClaudeResponse: JSON.stringify(result),
    },
  });
}
