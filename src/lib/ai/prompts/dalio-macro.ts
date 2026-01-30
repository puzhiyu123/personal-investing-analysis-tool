export interface DalioMacroResult {
  executiveSummary: string;

  cyclePositions: {
    shortTermDebtCycle: {
      position: string;
      description: string;
      phase: "early_expansion" | "late_expansion" | "tightening" | "recession" | "early_recovery";
    };
    longTermDebtCycle: {
      position: string;
      description: string;
      phase: "early" | "bubble" | "top" | "depression" | "deleveraging" | "normalization";
    };
    businessCycle: {
      position: string;
      description: string;
      phase: "expansion" | "peak" | "contraction" | "trough";
    };
  };

  indicators: {
    fedFundsRate: number;
    yieldCurve: {
      spread: number;
      inverted: boolean;
      description: string;
    };
    cpiInflation: number;
    pceInflation: number;
    unemploymentRate: number;
    gdpGrowth: number;
    creditSpreads: {
      investmentGrade: string;
      highYield: string;
      trend: string;
    };
    m2MoneySupply: {
      growth: string;
      trend: string;
    };
  };

  historicalAnalog: {
    period: string;
    description: string;
    similarities: string[];
    differences: string[];
    howItPlayed: string;
  };

  portfolioImplications: Array<{
    action: string;
    assetClass: string;
    reasoning: string;
    conviction: "high" | "medium" | "low";
  }>;

  thingsToWatch: Array<{
    indicator: string;
    threshold: string;
    currentValue: string;
    significance: string;
  }>;

  riskLevel: "Low" | "Moderate" | "Elevated" | "High" | "Critical";
  riskAssessment: string;
}

export function getDalioSystemPrompt(): string {
  return `You are Ray Dalio's macroeconomic analytical framework. You analyze the economy through the lens of Dalio's principles: debt cycles (short-term and long-term), the economic machine, and all-weather portfolio management.

## Cycle Framework:

### Short-Term Debt Cycle (5-8 years)
- **Early Expansion**: Credit growing, spending increasing, low inflation
- **Late Expansion**: Credit extended, asset prices rising, inflation building
- **Tightening**: Central bank raising rates, credit slowing
- **Recession**: Spending falling, unemployment rising, rates being cut
- **Early Recovery**: Rates low, credit beginning to expand again

### Long-Term Debt Cycle (50-75 years)
- **Early**: Debt levels low, productive lending dominant
- **Bubble**: Debt growing faster than income, speculative lending
- **Top**: Debt service costs unsustainable, bubble popping
- **Depression**: Deleveraging, defaults, deflation risk
- **Deleveraging**: Beautiful (balanced) or ugly (unbalanced)
- **Normalization**: Debt levels reset, new cycle begins

### Business Cycle
- **Expansion**: GDP growing above trend, corporate profits rising
- **Peak**: Growth rate decelerating, capacity constraints
- **Contraction**: GDP declining, profits falling
- **Trough**: Economy bottoming, setting up for recovery

## Risk Level Framework:
- **Low**: Goldilocks economy, few imbalances
- **Moderate**: Some concerning signals but manageable
- **Elevated**: Multiple warning signs, positioning adjustments needed
- **High**: Significant risks materializing, defensive positioning
- **Critical**: Crisis conditions, capital preservation priority

## Output:
Return a JSON object matching the DalioMacroResult TypeScript interface. Be specific with data points and provide actionable portfolio implications. The historical analog should be a specific period that most closely matches current conditions.`;
}

export function getDalioUserPrompt(
  perplexityData: Array<{ query: string; content: string }>
): string {
  const dataBlocks = perplexityData
    .map(
      (d, i) =>
        `### Research Area ${i + 1}\n**Query:** ${d.query}\n**Data:**\n${d.content}`
    )
    .join("\n\n---\n\n");

  return `Analyze the current macroeconomic environment using the Dalio framework. Here is the research data gathered:

${dataBlocks}

Based on this data, provide a comprehensive Dalio-style macro assessment. Return your analysis as a JSON object matching the DalioMacroResult interface. Be specific with numbers and provide actionable implications. The executive summary should be 2-3 paragraphs.`;
}
