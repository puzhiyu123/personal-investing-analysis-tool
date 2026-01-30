export function getDalioQueries(): string[] {
  return [
    // 1. Federal Reserve policy
    `What is the current Federal Reserve monetary policy stance? Include the current fed funds rate, recent FOMC decisions, dot plot projections, quantitative tightening status, and forward guidance. What is the Fed signaling about future rate moves?`,

    // 2. Rates and credit conditions
    `What are current US interest rates across the yield curve? Include 2-year, 5-year, 10-year, and 30-year Treasury yields. Is the yield curve inverted? What are investment-grade and high-yield credit spreads? How are lending standards changing?`,

    // 3. Inflation metrics
    `What are the latest US inflation readings? Include CPI (headline and core), PCE (headline and core), PPI, and wage growth. Are inflation expectations anchored? What is the trend direction? Compare to the Fed's 2% target.`,

    // 4. Employment and economic activity
    `What is the current state of the US labor market? Include unemployment rate, nonfarm payrolls trend, jobless claims, job openings (JOLTS), labor force participation, and any leading indicators of weakness. What is the latest GDP growth rate?`,

    // 5. Debt and liquidity
    `What is the current state of US government and private sector debt? Include federal debt-to-GDP, deficit spending levels, corporate debt levels, consumer debt, M2 money supply growth, and bank reserves. Are there any liquidity stress signals?`,

    // 6. Ray Dalio's recent commentary
    `What has Ray Dalio or Bridgewater Associates said recently about the economic outlook, debt cycles, and market positioning? Include any recent interviews, writings, or LinkedIn posts from the last 3 months.`,

    // 7. Market sentiment and positioning
    `What is the current market sentiment? Include the VIX level, put-call ratios, AAII investor sentiment, fund flows, margin debt levels, and any extreme positioning. What are the biggest risks markets are pricing or not pricing?`,
  ];
}

export const DALIO_QUERY_LABELS = [
  "Fed Policy",
  "Rates & Credit",
  "Inflation",
  "Employment & GDP",
  "Debt & Liquidity",
  "Dalio Commentary",
  "Market Sentiment",
];
