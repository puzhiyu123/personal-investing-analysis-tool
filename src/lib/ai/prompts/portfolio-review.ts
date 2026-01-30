export interface PortfolioReviewResult {
  executiveSummary: string;

  allocationAssessment: {
    currentBreakdown: Record<string, number>;
    targetComparison: string;
    overallAssessment: string;
  };

  thesisAlignment: Array<{
    ticker: string;
    companyName: string;
    originalThesis: string;
    currentStatus: string;
    aligned: boolean;
    concerns: string[];
    recommendation: string;
  }>;

  rebalancingSuggestions: Array<{
    action: string;
    ticker: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;

  riskAssessment: {
    concentrationRisk: string;
    correlationRisk: string;
    sectorExposure: string;
    overallRisk: "low" | "moderate" | "elevated" | "high";
  };
}

export function getPortfolioReviewSystemPrompt(): string {
  return `You are a portfolio review assistant combining concentrated investing principles (Buffett/Munger style - own your best ideas with conviction) with risk parity concepts (Dalio style - understand and balance risk exposures).

## Review Framework:

### Thesis Alignment
For each holding, assess whether the original investment thesis is still intact:
- Is the moat still strong?
- Has management changed or deteriorated?
- Are financials trending in the right direction?
- Have any exit criteria been triggered?

### Concentration vs Diversification
- 5-15 positions is ideal for a concentrated portfolio
- No single position should exceed 25% unless there's extreme conviction
- Sector concentration above 40% warrants a warning

### Risk Assessment
- Identify correlation between holdings
- Check for hidden sector or factor concentration
- Evaluate downside scenarios

## Output:
Return a JSON object matching the PortfolioReviewResult interface. Be specific and actionable.`;
}

export function getPortfolioReviewUserPrompt(
  holdings: Array<{
    ticker: string;
    companyName: string;
    quantity: number;
    costBasis: number;
    currentPrice: number;
    currentValue: number;
    thesis: string | null;
    exitCriteria: string | null;
    assetType: string;
  }>,
  holdingData: Array<{ query: string; content: string }>,
  allocationTargets: Record<string, number>
): string {
  const holdingsSummary = holdings
    .map(
      (h) =>
        `- ${h.ticker} (${h.companyName}): ${h.quantity} shares at $${h.costBasis} cost basis, current $${h.currentPrice}, value $${h.currentValue.toFixed(2)}, type: ${h.assetType}\n  Thesis: ${h.thesis || "Not specified"}\n  Exit criteria: ${h.exitCriteria || "Not specified"}`
    )
    .join("\n");

  const dataBlocks = holdingData
    .map((d) => `**${d.query}**\n${d.content}`)
    .join("\n\n");

  return `Review this portfolio:

## Holdings
${holdingsSummary}

## Allocation Targets
${JSON.stringify(allocationTargets, null, 2)}

## Recent Data on Holdings
${dataBlocks}

Provide a comprehensive portfolio review. Return as JSON matching the PortfolioReviewResult interface.`;
}
