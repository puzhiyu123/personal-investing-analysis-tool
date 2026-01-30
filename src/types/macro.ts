import type { DalioMacroResult } from "@/lib/ai/prompts/dalio-macro";

export type { DalioMacroResult };

export interface MacroReportData {
  id: string;
  status: string;
  reportDate: string;
  createdAt: string;

  // Cycle positions (parsed from JSON)
  shortTermDebtCycle: string | null;
  longTermDebtCycle: string | null;
  businessCycle: string | null;

  // Indicators
  fedFundsRate: number | null;
  yieldCurve: string | null;
  cpiInflation: number | null;
  pceInflation: number | null;
  unemploymentRate: number | null;
  gdpGrowth: number | null;
  creditSpreads: string | null;
  m2MoneySupply: string | null;

  // Analysis
  historicalAnalogPeriod: string | null;
  historicalAnalogDescription: string | null;
  historicalAnalogSimilarities: string | null;
  historicalAnalogDifferences: string | null;

  portfolioImplications: string | null;
  thingsToWatch: string | null;
  riskLevel: string | null;

  executiveSummary: string | null;
  simplifiedReport: string | null;
  fullReport: string | null;
}

export function parseJSON<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
