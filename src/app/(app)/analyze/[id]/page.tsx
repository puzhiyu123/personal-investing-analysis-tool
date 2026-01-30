"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { ExecutiveSummary } from "@/components/features/analysis/executive-summary";
import { FinancialAnalysis } from "@/components/features/analysis/financial-analysis";
import { MoatAssessment } from "@/components/features/analysis/moat-assessment";
import { AiDisruptionCard } from "@/components/features/analysis/ai-disruption-card";
import { BuffettScore } from "@/components/features/analysis/buffett-score";
import { QuestionsList } from "@/components/features/analysis/questions-list";
import { VerdictCard } from "@/components/features/analysis/verdict-card";
import { AnalysisProgress } from "@/components/features/analysis/analysis-progress";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AnalysisData {
  id: string;
  ticker: string;
  companyName: string;
  status: string;
  executiveSummary: string | null;
  verdict: string | null;
  verdictReasoning: string | null;

  revenueGrowth: string | null;
  ownerEarnings: string | null;
  margins: string | null;
  roic: string | null;
  debtToEquity: number | null;
  freeCashFlow: string | null;

  moatType: string | null;
  moatScore: number | null;
  moatEvidence: string | null;
  moatThreats: string | null;

  aiDisruptionLevel: string | null;
  aiDisruptionScore: number | null;
  aiDisruptionAnalysis: string | null;

  businessQualityScore: number | null;
  managementScore: number | null;
  financialStrengthScore: number | null;
  valuationScore: number | null;
  moatDurabilityScore: number | null;

  generatedQuestions: string | null;
  keyRisks: string | null;
  keyCatalysts: string | null;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);

        // Poll if still in progress
        if (data.status === "IN_PROGRESS") {
          setTimeout(fetchData, 5000);
        }
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Analysis not found.
      </div>
    );
  }

  const questions = analysis.generatedQuestions
    ? JSON.parse(analysis.generatedQuestions)
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/analyze"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to analyses
      </Link>

      {analysis.status !== "COMPLETE" && (
        <AnalysisProgress status={analysis.status} />
      )}

      {analysis.status === "COMPLETE" && (
        <>
          <ExecutiveSummary
            ticker={analysis.ticker}
            companyName={analysis.companyName}
            summary={analysis.executiveSummary || ""}
            verdict={analysis.verdict || ""}
            moatType={analysis.moatType || undefined}
            aiDisruptionLevel={analysis.aiDisruptionLevel || undefined}
          />

          <BuffettScore
            businessQuality={analysis.businessQualityScore}
            management={analysis.managementScore}
            financialStrength={analysis.financialStrengthScore}
            valuation={analysis.valuationScore}
            moatDurability={analysis.moatDurabilityScore}
          />

          <FinancialAnalysis
            revenueGrowth={analysis.revenueGrowth}
            ownerEarnings={analysis.ownerEarnings}
            margins={analysis.margins}
            roic={analysis.roic}
            debtToEquity={analysis.debtToEquity}
            freeCashFlow={analysis.freeCashFlow}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <MoatAssessment
              moatType={analysis.moatType}
              moatScore={analysis.moatScore}
              moatEvidence={analysis.moatEvidence}
              moatThreats={analysis.moatThreats}
            />
            <AiDisruptionCard
              level={analysis.aiDisruptionLevel}
              score={analysis.aiDisruptionScore}
              analysis={analysis.aiDisruptionAnalysis}
            />
          </div>

          <VerdictCard
            verdict={analysis.verdict}
            reasoning={analysis.verdictReasoning}
            keyRisks={analysis.keyRisks}
            keyCatalysts={analysis.keyCatalysts}
          />

          {questions.length > 0 && (
            <QuestionsList
              analysisId={analysis.id}
              questions={questions}
            />
          )}
        </>
      )}
    </div>
  );
}
