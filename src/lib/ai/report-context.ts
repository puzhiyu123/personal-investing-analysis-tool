export function buildReportContext(report: Record<string, unknown>): string {
  const sections: string[] = [];

  if (report.riskLevel) {
    sections.push(`Risk Level: ${report.riskLevel}`);
  }

  if (report.executiveSummary) {
    sections.push(`Executive Summary:\n${report.executiveSummary}`);
  }

  // Cycle positions
  const cycles = ["shortTermDebtCycle", "longTermDebtCycle", "businessCycle"];
  for (const key of cycles) {
    if (report[key]) {
      try {
        const cycle = JSON.parse(report[key] as string);
        sections.push(
          `${key.replace(/([A-Z])/g, " $1").trim()}:\nPosition: ${cycle.position}\nPhase: ${cycle.phase}\nDescription: ${cycle.description}`
        );
      } catch {
        // skip malformed data
      }
    }
  }

  // Indicators
  const indicators = [
    ["fedFundsRate", "Fed Funds Rate"],
    ["cpiInflation", "CPI Inflation"],
    ["pceInflation", "PCE Inflation"],
    ["unemploymentRate", "Unemployment Rate"],
    ["gdpGrowth", "GDP Growth"],
  ];
  const indicatorLines: string[] = [];
  for (const [key, label] of indicators) {
    if (report[key] != null) {
      indicatorLines.push(`${label}: ${report[key]}%`);
    }
  }

  const jsonIndicators = [
    ["yieldCurve", "Yield Curve"],
    ["creditSpreads", "Credit Spreads"],
    ["m2MoneySupply", "M2 Money Supply"],
  ];
  for (const [key, label] of jsonIndicators) {
    if (report[key]) {
      try {
        const data = JSON.parse(report[key] as string);
        indicatorLines.push(`${label}: ${JSON.stringify(data)}`);
      } catch {
        // skip
      }
    }
  }

  if (indicatorLines.length > 0) {
    sections.push(`Key Economic Indicators:\n${indicatorLines.join("\n")}`);
  }

  // Historical analog
  if (report.historicalAnalogPeriod) {
    let analogSection = `Historical Analog: ${report.historicalAnalogPeriod}`;
    if (report.historicalAnalogDescription) {
      analogSection += `\n${report.historicalAnalogDescription}`;
    }
    try {
      const sims = JSON.parse(
        (report.historicalAnalogSimilarities as string) || "[]"
      );
      if (sims.length > 0) {
        analogSection += `\nSimilarities: ${sims.join("; ")}`;
      }
    } catch {
      // skip
    }
    try {
      const diffs = JSON.parse(
        (report.historicalAnalogDifferences as string) || "[]"
      );
      if (diffs.length > 0) {
        analogSection += `\nDifferences: ${diffs.join("; ")}`;
      }
    } catch {
      // skip
    }
    sections.push(analogSection);
  }

  // Portfolio implications
  if (report.portfolioImplications) {
    try {
      const implications = JSON.parse(report.portfolioImplications as string);
      if (Array.isArray(implications) && implications.length > 0) {
        const implLines = implications.map(
          (imp: { action: string; assetClass: string; reasoning: string; conviction: string }) =>
            `- ${imp.action} (${imp.assetClass}, ${imp.conviction} conviction): ${imp.reasoning}`
        );
        sections.push(
          `Portfolio Implications:\n${implLines.join("\n")}`
        );
      }
    } catch {
      // skip
    }
  }

  // Things to watch
  if (report.thingsToWatch) {
    try {
      const items = JSON.parse(report.thingsToWatch as string);
      if (Array.isArray(items) && items.length > 0) {
        const watchLines = items.map(
          (item: { indicator: string; threshold: string; currentValue: string; significance: string }) =>
            `- ${item.indicator} (current: ${item.currentValue}, threshold: ${item.threshold}): ${item.significance}`
        );
        sections.push(`Things to Watch:\n${watchLines.join("\n")}`);
      }
    } catch {
      // skip
    }
  }

  return sections.join("\n\n");
}
