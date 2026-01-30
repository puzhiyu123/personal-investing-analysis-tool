export type DecisionAction = "BUY" | "SELL" | "PASS" | "WATCH" | "TRIM" | "ADD";

export interface FollowUpNote {
  date: string;
  note: string;
}

export interface DecisionData {
  id: string;
  ticker: string;
  action: DecisionAction;
  decisionDate: string;
  priceAtDecision: number | null;
  thesis: string | null;
  reasoning: string | null;
  followUpNotes: FollowUpNote[];
  outcome: string | null;
  analysisId: string | null;
  holdingId: string | null;
  createdAt: string;
}

export interface DecisionPatterns {
  total: number;
  byAction: Record<string, number>;
  correct: number;
  incorrect: number;
  pending: number;
  accuracy: number;
}

export function parseFollowUpNotes(json: string | null): FollowUpNote[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export const ACTION_COLORS: Record<string, string> = {
  BUY: "success",
  SELL: "error",
  PASS: "secondary",
  WATCH: "warning",
  TRIM: "accent",
  ADD: "default",
};

export const ACTION_LABELS: Record<string, string> = {
  BUY: "Buy",
  SELL: "Sell",
  PASS: "Pass",
  WATCH: "Watch",
  TRIM: "Trim",
  ADD: "Add",
};
