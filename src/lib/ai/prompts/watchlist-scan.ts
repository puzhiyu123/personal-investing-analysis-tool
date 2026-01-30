export interface WatchlistScanEvaluation {
  ticker: string;
  currentPrice: number | null;
  priceChange7d: number | null;
  newsHeadline: string | null;
  note: string;
  targetHit: boolean;
  urgency: "LOW" | "MEDIUM" | "HIGH";
}

export interface WatchlistScanResult {
  evaluations: WatchlistScanEvaluation[];
  summary: string;
}

export function getWatchlistScanSystemPrompt(): string {
  return `You are a watchlist monitoring assistant. Your job is to evaluate each watched ticker for recent news, price movements, and whether target conditions appear to be met.

## Rules:

1. **Evaluate every ticker** in the watchlist. Even if there's no news, provide a status note.

2. **Urgency levels:**
   - HIGH: Target price/condition appears met, major news event, or >10% price move
   - MEDIUM: Notable news, 5-10% price move, or approaching target
   - LOW: No significant changes, routine activity

3. **Target evaluation:** If a ticker has a targetPrice or targetCondition, check whether the current data suggests it has been met. Set targetHit=true only if the condition appears satisfied based on available data.

4. **Notes:** Write a concise 1-2 sentence status summary for each ticker covering the most important recent development or current state.

5. **Summary:** Write a 1-2 sentence overall watchlist health summary.

## Output Format:
Return ONLY a valid JSON object (no markdown, no code fences):

{
  "evaluations": [
    {
      "ticker": "AAPL",
      "currentPrice": 185.50,
      "priceChange7d": -2.3,
      "newsHeadline": "Apple reports Q4 earnings beat",
      "note": "Stock pulled back 2.3% after earnings despite beating estimates. Trading near 52-week high.",
      "targetHit": false,
      "urgency": "MEDIUM"
    }
  ],
  "summary": "Overall watchlist summary"
}`;
}

export function getWatchlistScanUserPrompt(
  items: Array<{
    ticker: string;
    reason: string | null;
    targetPrice: number | null;
    targetCondition: string | null;
  }>,
  perplexityData: Array<{ query: string; content: string }>
): string {
  const itemsBlock = items
    .map((item) => {
      let entry = `- ${item.ticker}`;
      if (item.reason) entry += `\n  Reason: ${item.reason}`;
      if (item.targetPrice != null) entry += `\n  Target price: $${item.targetPrice}`;
      if (item.targetCondition) entry += `\n  Target condition: ${item.targetCondition}`;
      return entry;
    })
    .join("\n");

  const dataBlocks = perplexityData
    .map(
      (d, i) =>
        `### Research Area ${i + 1}\n**Query:** ${d.query}\n**Data:**\n${d.content}`
    )
    .join("\n\n---\n\n");

  return `Evaluate the following watchlist items based on the research data.

## Watchlist Items:
${itemsBlock}

## Recent Research Data:
${dataBlocks}

Based on the research data, evaluate each watchlist item. Check whether any target prices or conditions have been met. Provide a status note for every ticker.`;
}
