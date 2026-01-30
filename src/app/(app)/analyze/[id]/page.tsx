"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { ResearchNotes } from "@/components/features/analysis/research-notes";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ResearchNote {
  id: string;
  content: string;
  createdAt: string;
}

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

  researchNotes: string | null;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);

        // Parse research notes from JSON on load
        if (data.researchNotes) {
          try {
            setResearchNotes(JSON.parse(data.researchNotes));
          } catch {
            // ignore parse errors
          }
        }

        // Poll if still in progress or updating
        if (data.status === "IN_PROGRESS" || data.status === "UPDATING") {
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

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleNotesChange = useCallback(
    (notes: ResearchNote[]) => {
      setResearchNotes(notes);

      // Debounced auto-save (1.5s)
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/analyze/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ researchNotes: notes }),
          });
        } catch (error) {
          console.error("Failed to save research notes:", error);
        }
      }, 1500);
    },
    [id]
  );

  const handleRefresh = useCallback(async () => {
    // Save notes immediately before triggering refresh
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    try {
      await fetch(`/api/analyze/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchNotes: researchNotes }),
      });
    } catch (error) {
      console.error("Failed to save notes before refresh:", error);
    }

    // Trigger re-analysis
    try {
      const res = await fetch(`/api/analyze/${id}/refresh`, {
        method: "POST",
      });
      if (res.ok) {
        // Update local status and start polling
        setAnalysis((prev) =>
          prev ? { ...prev, status: "UPDATING" } : prev
        );
        setTimeout(fetchData, 5000);
      }
    } catch (error) {
      console.error("Failed to trigger refresh:", error);
    }
  }, [id, researchNotes, fetchData]);

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

  const isComplete = analysis.status === "COMPLETE";
  const isUpdating = analysis.status === "UPDATING";
  const showAnalysis = isComplete || isUpdating;

  return (
    <div className="space-y-8">
      <Link
        href="/analyze"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to analyses
      </Link>

      {analysis.status === "FAILED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 py-8 text-center space-y-3">
          <p className="text-red-700 font-medium">Analysis failed</p>
          <p className="text-sm text-red-600">
            The analysis encountered an error. You can try running a new analysis.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analyze — Run New Analysis
          </Link>
        </div>
      )}

      {analysis.status === "IN_PROGRESS" && (
        <AnalysisProgress status={analysis.status} />
      )}

      {isUpdating && (
        <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-primary-700">
            Analysis is updating with your research notes...
          </p>
        </div>
      )}

      {showAnalysis && (
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

          <ResearchNotes
            analysisId={analysis.id}
            notes={researchNotes}
            onNotesChange={handleNotesChange}
            onRefresh={handleRefresh}
            isUpdating={isUpdating}
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
