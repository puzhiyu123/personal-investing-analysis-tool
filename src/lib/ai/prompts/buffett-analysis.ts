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
Return ONLY a valid JSON object (no markdown, no code fences) with this exact structure. The overall score is the weighted average: Business Quality (25%), Management (15%), Financial Strength (20%), Valuation (25%), Moat Durability (15%).

{
  "companyName": "Full Company Name",
  "executiveSummary": "2-3 paragraph summary",
  "financials": {
    "revenueGrowth": { "fiveYearCAGR": 12.5, "trend": "...", "assessment": "..." },
    "ownerEarnings": { "latestValue": "$X.XB", "trend": "...", "calculation": "..." },
    "margins": { "gross": 45.2, "operating": 22.1, "net": 18.3, "trend": "..." },
    "roic": { "current": 25.3, "fiveYearAvg": 22.1, "vsWacc": "..." },
    "debtToEquity": 0.45,
    "freeCashFlow": { "latest": "$X.XB", "trend": "...", "perShare": "$XX.XX" }
  },
  "moat": {
    "type": "e.g. Brand, Network Effects, Cost Advantages, Switching Costs",
    "score": 8,
    "evidence": ["..."],
    "threats": ["..."],
    "durabilityAssessment": "..."
  },
  "aiDisruption": {
    "level": "Low | Medium | High | Critical",
    "score": 3,
    "analysis": "...",
    "timeframe": "...",
    "mitigatingFactors": ["..."]
  },
  "scores": {
    "businessQuality": 8,
    "management": 7,
    "financialStrength": 8,
    "valuation": 6,
    "moatDurability": 8,
    "overall": 7.4
  },
  "verdict": "BUY" | "WATCH" | "PASS",
  "verdictReasoning": "...",
  "keyRisks": ["..."],
  "keyCatalysts": ["..."],
  "generatedQuestions": [
    { "question": "...", "category": "Business Understanding", "answered": false }
  ]
}

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
  perplexityData: Array<{ query: string; content: string }>,
  researchNotes?: Array<{ id: string; content: string; createdAt: string }>,
  existingQuestions?: Array<{
    question: string;
    category: string;
    answered: boolean;
  }>
): string {
  const dataBlocks = perplexityData
    .map(
      (d, i) =>
        `### Research Area ${i + 1}\n**Query:** ${d.query}\n**Data:**\n${d.content}`
    )
    .join("\n\n---\n\n");

  let notesSection = "";
  if (researchNotes && researchNotes.length > 0) {
    const noteTexts = researchNotes
      .map(
        (n) =>
          `[${new Date(n.createdAt).toLocaleDateString()}]\n${n.content}`
      )
      .join("\n\n---\n\n");
    notesSection = `

## Investor's Own Research Notes

The investor has provided their own research and observations. Factor these into your analysis — they may contain information not available in the research data above, correct inaccuracies, or provide additional context.

${noteTexts}`;
  }

  let questionsSection = "";
  if (existingQuestions && existingQuestions.length > 0) {
    const questionsList = existingQuestions
      .map(
        (q) =>
          `- [${q.answered ? "ANSWERED" : "UNANSWERED"}] (${q.category}) ${q.question}`
      )
      .join("\n");
    questionsSection = `

## Previous Research Questions

The investor previously had these research questions. Review them in light of the research notes above:
- If a question is now answerable from the research notes or updated data, mark it as answered (answered: true)
- Keep unanswered questions that are still relevant
- Remove questions that are no longer relevant
- Add new, deeper questions that arise from the research notes — the investor's own research may reveal new areas worth investigating

${questionsList}

For your generatedQuestions output: include all still-relevant questions (with updated answered status) plus any new questions. Preserve the original question text for carried-over questions. New questions should be specific and actionable.`;
  }

  return `Analyze ${ticker} using the Buffett investment framework. Here is the research data gathered:

${dataBlocks}
${notesSection}
${questionsSection}

Based on this data, provide a comprehensive Buffett-style analysis. Return your analysis as a JSON object matching the BuffettAnalysisResult interface. Be specific with numbers and evidence. The executive summary should be 2-3 paragraphs.`;
}
