export function getBuffettQueries(ticker: string): string[] {
  return [
    // 1. Financial fundamentals
    `What are ${ticker}'s key financial metrics for the last 5 years? Include revenue, net income, free cash flow, operating margins, ROIC, ROE, debt-to-equity ratio, and owner earnings. Provide specific numbers for each year.`,

    // 2. Moat analysis
    `What is ${ticker}'s competitive moat? Analyze their pricing power, switching costs, network effects, intangible assets (brands, patents), cost advantages, and market position. How durable is the moat? What threatens it?`,

    // 3. Management quality
    `Who is the current management team at ${ticker}? Analyze their capital allocation track record, insider ownership, compensation structure, and strategic vision. Have they demonstrated shareholder-friendly practices?`,

    // 4. AI disruption assessment
    `How might AI and automation disrupt ${ticker}'s business model? What percentage of their revenue could be at risk from AI disruption in the next 5-10 years? Are they investing in AI capabilities? What's their AI strategy?`,

    // 5. Recent news and developments
    `What are the most significant recent developments for ${ticker} in the last 6 months? Include earnings results, strategic announcements, regulatory changes, market share changes, and analyst upgrades/downgrades.`,

    // 6. Competitive landscape
    `Who are ${ticker}'s main competitors? How does ${ticker} compare on margins, growth, market share, and competitive positioning? Are any competitors threatening their market position?`,

    // 7. Valuation context
    `What is ${ticker}'s current valuation? Include P/E ratio (TTM and forward), P/FCF, EV/EBITDA, PEG ratio, and how these compare to the company's 5-year average and sector peers. What are analysts' price targets?`,
  ];
}

export const BUFFETT_QUERY_LABELS = [
  "Financial Fundamentals",
  "Moat Analysis",
  "Management Quality",
  "AI Disruption",
  "Recent News",
  "Competitive Landscape",
  "Valuation",
];
