export function getScanQueries(tickers: string[]): string[] {
  const tickerList = tickers.join(", ");

  return [
    // 1. Breaking news & events
    `What are the most significant material events for these stocks in the last 7 days: ${tickerList}? For each ticker that has notable news, include: earnings surprises, SEC filings, analyst upgrades/downgrades, management changes, >5% price moves, regulatory actions, or material announcements. Only mention tickers with actual material news — skip those with nothing notable.`,

    // 2. Fundamental changes & threats
    `For the following stocks, what are the most significant fundamental changes or emerging threats in the last 30 days: ${tickerList}? Include: revenue/earnings estimate revisions, competitive threats, market share shifts, supply chain issues, margin pressure, debt concerns, or business model risks. Only mention tickers with meaningful fundamental changes — skip those with stable fundamentals.`,
  ];
}

export const SCAN_QUERY_LABELS = [
  "Breaking News & Events",
  "Fundamental Changes & Threats",
];
