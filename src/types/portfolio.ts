export interface HoldingData {
  id: string;
  ticker: string;
  companyName: string;
  assetType: string;
  quantity: number;
  costBasis: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  entryDate: string;
  thesis: string | null;
  exitCriteria: string | null;
  status: string;
  gainLoss: number;
  gainLossPercent: number;
}

export interface AllocationEntry {
  assetType: string;
  label: string;
  currentPercent: number;
  targetPercent: number;
  currentValue: number;
  deviation: number;
}

export interface AllocationTargets {
  liquid: number;
  equities: number;
  crypto: number;
  bonds: number;
  other: number;
  [key: string]: number;
}

export const DEFAULT_ALLOCATION_TARGETS: AllocationTargets = {
  liquid: 65,
  equities: 12.5,
  crypto: 10,
  bonds: 7.5,
  other: 5,
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  CASH: "Liquid / Cash",
  EQUITY: "Equities",
  ETF: "ETFs",
  CRYPTO: "Crypto",
  BOND: "Bonds",
  OTHER: "Other",
};

export const ALLOCATION_TYPE_MAP: Record<string, string> = {
  CASH: "liquid",
  EQUITY: "equities",
  ETF: "equities",
  CRYPTO: "crypto",
  BOND: "bonds",
  OTHER: "other",
};

export interface RebalancingSuggestion {
  assetType: string;
  action: "INCREASE" | "DECREASE" | "HOLD";
  currentPercent: number;
  targetPercent: number;
  deviation: number;
  message: string;
}

export function parseAllocationTargets(json: string): AllocationTargets {
  try {
    const parsed = JSON.parse(json);
    return { ...DEFAULT_ALLOCATION_TARGETS, ...parsed };
  } catch {
    return DEFAULT_ALLOCATION_TARGETS;
  }
}

export function computeGainLoss(holding: {
  totalCost: number;
  currentValue: number;
}): { gainLoss: number; gainLossPercent: number } {
  const gainLoss = holding.currentValue - holding.totalCost;
  const gainLossPercent =
    holding.totalCost > 0 ? (gainLoss / holding.totalCost) * 100 : 0;
  return { gainLoss, gainLossPercent };
}
