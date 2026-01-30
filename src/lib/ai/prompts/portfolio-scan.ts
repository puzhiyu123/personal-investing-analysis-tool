export interface PortfolioScanAlert {
  ticker: string | null;
  alertType: "NEWS" | "FUNDAMENTAL" | "MACRO" | "THESIS_VIOLATION";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  description: string;
  actionSuggested: string | null;
}

export interface WatchlistSuggestion {
  ticker: string;
  companyName: string;
  reason: string;
}

export interface PortfolioScanResult {
  alerts: PortfolioScanAlert[];
  watchlistSuggestions: WatchlistSuggestion[];
  summary: string;
}

export function getScanSystemPrompt(): string {
  return `You are a portfolio screening assistant. Your job is to review a portfolio of holdings against recent news, fundamental data, and macro signals, then flag ONLY items that require the investor's attention.

## Rules:

1. **Only flag concerns, not routine positive news.** Do NOT alert on normal earnings beats, routine analyst coverage, or general market movements unless they materially affect a holding.

2. **Severity levels:**
   - CRITICAL: Immediate action may be needed — e.g., major earnings miss (>15%), fraud/accounting scandal, regulatory ban, dividend cut, credit downgrade, thesis-breaking event
   - WARNING: Should review soon — e.g., moderate earnings miss, significant competitor threat, management departure, estimate revisions down >10%, margin compression
   - INFO: Worth noting — e.g., analyst downgrade, minor estimate revision, sector rotation risk, relevant macro shift

3. **Alert types:**
   - NEWS: Material news event in the last 7 days
   - FUNDAMENTAL: Change in financial metrics or competitive position
   - MACRO: Macro environment shift that affects this holding
   - THESIS_VIOLATION: Something that contradicts the investor's stated thesis or triggers their exit criteria

4. **Thesis violations are the highest priority.** If a holding has a thesis and exit criteria, check whether any news or fundamental change violates them. These should generally be WARNING or CRITICAL.

5. **Watchlist suggestions:** If the research mentions companies that would complement or hedge the portfolio, suggest adding them to the watchlist. Only suggest 0-3 tickers maximum, and only if there's a clear reason.

6. **Summary:** Write a 1-2 sentence overall portfolio health summary.

7. **Be selective.** A good scan might produce 0-5 alerts. Don't force alerts where there are none. An empty alerts array is perfectly valid.

## Output Format:
Return ONLY a valid JSON object (no markdown, no code fences):

{
  "alerts": [
    {
      "ticker": "AAPL",
      "alertType": "NEWS",
      "severity": "WARNING",
      "title": "Brief alert title",
      "description": "2-3 sentence description of what happened and why it matters",
      "actionSuggested": "Specific action to consider, or null"
    }
  ],
  "watchlistSuggestions": [
    {
      "ticker": "MSFT",
      "companyName": "Microsoft Corporation",
      "reason": "Why this would complement the portfolio"
    }
  ],
  "summary": "Overall portfolio health summary"
}`;
}

export function getScanUserPrompt(
  holdings: Array<{
    ticker: string;
    companyName: string;
    assetType: string;
    currentValue: number;
    thesis: string | null;
    exitCriteria: string | null;
  }>,
  perplexityData: Array<{ query: string; content: string }>,
  macroContext: string | null
): string {
  const holdingsBlock = holdings
    .map((h) => {
      let entry = `- ${h.ticker} (${h.companyName || "Unknown"}) — ${h.assetType}, Value: $${h.currentValue.toLocaleString()}`;
      if (h.thesis) entry += `\n  Thesis: ${h.thesis}`;
      if (h.exitCriteria) entry += `\n  Exit criteria: ${h.exitCriteria}`;
      return entry;
    })
    .join("\n");

  const dataBlocks = perplexityData
    .map(
      (d, i) =>
        `### Research Area ${i + 1}\n**Query:** ${d.query}\n**Data:**\n${d.content}`
    )
    .join("\n\n---\n\n");

  let prompt = `Screen the following portfolio holdings for actionable concerns.

## Holdings:
${holdingsBlock}

## Recent Research Data:
${dataBlocks}`;

  if (macroContext) {
    prompt += `\n\n## Current Macro Environment:
${macroContext}`;
  }

  prompt += `\n\nBased on the research data and macro context, identify any alerts the investor should see. Remember: only flag genuine concerns, not routine positive news. Check each holding's thesis and exit criteria for violations.`;

  return prompt;
}
