import type { BuffettAnalysisResult } from "@/lib/ai/prompts/buffett-analysis";

export type { BuffettAnalysisResult };

export interface CompanyAnalysisData {
  id: string;
  ticker: string;
  companyName: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  // Parsed data
  financials?: BuffettAnalysisResult["financials"];
  moat?: BuffettAnalysisResult["moat"];
  aiDisruption?: BuffettAnalysisResult["aiDisruption"];
  scores?: BuffettAnalysisResult["scores"];

  generatedQuestions?: Array<{
    question: string;
    category: string;
    answered: boolean;
  }>;

  verdict?: string;
  executiveSummary?: string;
  fullReport?: string;
  keyRisks?: string[];
  keyCatalysts?: string[];

  // Raw scores
  businessQualityScore?: number;
  managementScore?: number;
  financialStrengthScore?: number;
  valuationScore?: number;
  moatDurabilityScore?: number;

  moatType?: string;
  moatScore?: number;
  aiDisruptionLevel?: string;
  aiDisruptionScore?: number;
}

export function parseAnalysisData(raw: Record<string, unknown>): CompanyAnalysisData {
  return {
    ...raw,
    keyRisks: raw.keyRisks ? JSON.parse(raw.keyRisks as string) : [],
    keyCatalysts: raw.keyCatalysts ? JSON.parse(raw.keyCatalysts as string) : [],
    generatedQuestions: raw.generatedQuestions
      ? JSON.parse(raw.generatedQuestions as string)
      : [],
  } as CompanyAnalysisData;
}
