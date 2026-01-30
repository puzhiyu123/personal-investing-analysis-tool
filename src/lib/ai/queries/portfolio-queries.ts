export function getPortfolioQueries(
  tickers: string[]
): string[] {
  return tickers.map(
    (ticker) =>
      `What is ${ticker}'s current stock price, recent price performance (1 week, 1 month, 3 months, YTD), and any significant recent news or developments? Include any analyst rating changes.`
  );
}
