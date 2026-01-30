export function getWatchlistScanQueries(tickers: string[]): string[] {
  const tickerList = tickers.join(", ");

  return [
    // 1. News & events (past 14 days)
    `What are the most significant news and events for these stocks in the last 14 days: ${tickerList}? For each ticker with notable news, include: earnings announcements, analyst upgrades/downgrades, price moves greater than 5%, M&A activity, regulatory actions, management changes, or material announcements. Skip tickers with nothing notable.`,

    // 2. Price & valuation
    `For the following stocks, provide current price and valuation data: ${tickerList}. For each ticker include: current stock price, 52-week high and low, recent analyst price targets, forward P/E ratio, and any significant price level breaks. Focus on factual data points.`,
  ];
}

export const WATCHLIST_SCAN_QUERY_LABELS = [
  "News & Events (14 days)",
  "Price & Valuation",
];
