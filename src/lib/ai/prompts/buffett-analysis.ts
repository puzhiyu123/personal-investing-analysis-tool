export interface BuffettAnalysisResult {
  companyName: string;
  executiveSummary: string;

  financials: {
    revenueGrowth: {
      fiveYearCAGR: number;
      trend: string;
      assessment: string;
    };
    ownerEarnings: {
      latestValue: string;
      trend: string;
      calculation: string;
    };
    margins: {
      gross: number;
      operating: number;
      net: number;
      trend: string;
    };
    roic: {
      current: number;
      fiveYearAvg: number;
      vsWacc: string;
    };
    debtToEquity: number;
    freeCashFlow: {
      latest: string;
      trend: string;
      perShare: string;
    };
  };

  moat: {
    type: string;
    score: number;
    evidence: string[];
    threats: string[];
    durabilityAssessment: string;
  };

  aiDisruption: {
    level: string;
    score: number;
    analysis: string;
    timeframe: string;
    mitigatingFactors: string[];
  };

  scores: {
    businessQuality: number;
    management: number;
    financialStrength: number;
    valuation: number;
    moatDurability: number;
    overall: number;
  };

  verdict: "BUY" | "WATCH" | "PASS";
  verdictReasoning: string;

  keyRisks: string[];
  keyCatalysts: string[];

  generatedQuestions: Array<{
    question: string;
    category: string;
    answered: boolean;
  }>;
}

export function getBuffettSystemPrompt(): string {
  return `You are Warren Buffett's analytical framework, applied to modern investing. You analyze companies through the lens of Buffett's investment principles: quality businesses, durable competitive moats, honest/capable management, and reasonable valuations.

## Scoring Rules (1-10 scale for each criterion):

### Business Quality (1-10)
- 9-10: Exceptional business with consistent >20% ROIC, growing moat, pricing power
- 7-8: Strong business with >15% ROIC, solid competitive position
- 5-6: Average business, competitive but no clear advantage
- 3-4: Below average, declining metrics or commoditized
- 1-2: Poor business fundamentals, value destructive

### Management (1-10)
- 9-10: Outstanding capital allocators, significant insider ownership, transparent
- 7-8: Good operators, reasonable capital allocation, aligned incentives
- 5-6: Competent but not exceptional
- 3-4: Questionable decisions, poor capital allocation
- 1-2: Shareholder-unfriendly, destroying value

### Financial Strength (1-10)
- 9-10: Net cash position, growing FCF, exceptional margins
- 7-8: Low debt, strong cash generation, healthy margins
- 5-6: Moderate debt, adequate cash flow
- 3-4: High leverage, inconsistent cash flow
- 1-2: Distressed balance sheet

### Valuation (1-10)
- 9-10: Trading below intrinsic value by >30%
- 7-8: Reasonably valued or slightly cheap
- 5-6: Fairly valued
- 3-4: Somewhat expensive
- 1-2: Extremely overvalued

### Moat Durability (1-10)
- 9-10: Moat widening, multiple reinforcing advantages
- 7-8: Strong moat, likely to persist 10+ years
- 5-6: Moderate moat, some erosion risk
- 3-4: Narrow moat, significant competitive threats
- 1-2: No moat or moat under severe attack

## Verdict Rules:
- BUY: Overall score >= 7.0 AND no individual score below 5
- WATCH: Overall score >= 5.5 OR any individual score below 5 with high potential
- PASS: Overall score < 5.5 OR multiple scores below 4

## Output Format:
Return a JSON object matching the BuffettAnalysisResult TypeScript interface. The overall score is the weighted average: Business Quality (25%), Management (15%), Financial Strength (20%), Valuation (25%), Moat Durability (15%).

Generate exactly 25 questions across these categories:
- Business Understanding (5 questions)
- Competitive Position (5 questions)
- Financial Health (5 questions)
- Management Assessment (5 questions)
- Valuation & Timing (5 questions)

These should be specific, actionable questions the investor should research before making a final decision.`;
}

export function getBuffettUserPrompt(
  ticker: string,
  perplexityData: Array<{ query: string; content: string }>
): string {
  const dataBlocks = perplexityData
    .map(
      (d, i) =>
        `### Research Area ${i + 1}\n**Query:** ${d.query}\n**Data:**\n${d.content}`
    )
    .join("\n\n---\n\n");

  return `Analyze ${ticker} using the Buffett investment framework. Here is the research data gathered:

${dataBlocks}

Based on this data, provide a comprehensive Buffett-style analysis. Return your analysis as a JSON object matching the BuffettAnalysisResult interface. Be specific with numbers and evidence. The executive summary should be 2-3 paragraphs.`;
}
