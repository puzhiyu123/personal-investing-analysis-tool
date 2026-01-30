"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface IndicatorsDashboardProps {
  fedFundsRate: number | null;
  yieldCurve: string | null;
  cpiInflation: number | null;
  pceInflation: number | null;
  unemploymentRate: number | null;
  gdpGrowth: number | null;
  creditSpreads: string | null;
  m2MoneySupply: string | null;
}

function parseJSON(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const INDICATOR_EXPLAINERS: Record<string, string> = {
  "Fed Funds Rate":
    "The interest rate at which banks lend to each other overnight. The Fed raises this rate to cool inflation and lowers it to stimulate growth. Higher rates make borrowing more expensive across the economy.",
  "Yield Curve (10Y-2Y)":
    "The spread between 10-year and 2-year Treasury yields. When inverted (negative), it historically signals a recession within 6-18 months. A steepening curve suggests economic recovery.",
  "CPI Inflation":
    "Consumer Price Index measures the average change in prices paid by consumers for goods and services. The Fed targets 2% annually. Higher values erode purchasing power.",
  "PCE Inflation":
    "Personal Consumption Expenditures — the Fed's preferred inflation measure. It's broader than CPI and typically runs slightly lower. The Fed's target is also 2%.",
  "Unemployment":
    "The percentage of the labor force that is unemployed but actively seeking work. Below 4% is generally considered full employment. Rising unemployment often signals economic contraction.",
  "GDP Growth":
    "Gross Domestic Product growth rate — the broadest measure of economic activity. 2-3% is considered healthy for the US. Negative GDP growth for two quarters is a common recession definition.",
  "Credit Spreads (IG)":
    "The difference in yield between investment-grade corporate bonds and Treasuries. Widening spreads signal increasing credit risk and stress in financial markets. Tight spreads suggest confidence.",
  "M2 Money Supply":
    "The total amount of money in circulation including cash, checking deposits, and near-money. Rapid growth can signal future inflation; contraction can indicate deflationary pressures.",
};

function IndicatorCard({
  label,
  value,
  note,
  noteColor,
}: {
  label: string;
  value: string;
  note?: string;
  noteColor?: string;
}) {
  const [showExplainer, setShowExplainer] = useState(false);
  const explainer = INDICATOR_EXPLAINERS[label];

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {explainer && (
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="text-muted-foreground hover:text-primary-500 transition-colors shrink-0"
            title="What does this mean?"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      {note && (
        <p className={`mt-1 text-sm font-medium ${noteColor || "text-muted-foreground"}`}>
          {note}
        </p>
      )}
      {showExplainer && explainer && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {explainer}
        </p>
      )}
    </div>
  );
}

export function IndicatorsDashboard({
  fedFundsRate,
  yieldCurve,
  cpiInflation,
  pceInflation,
  unemploymentRate,
  gdpGrowth,
  creditSpreads,
  m2MoneySupply,
}: IndicatorsDashboardProps) {
  const [showAllExplainers, setShowAllExplainers] = useState(false);
  const yc = parseJSON(yieldCurve);
  const cs = parseJSON(creditSpreads);
  const m2 = parseJSON(m2MoneySupply);

  const indicators = [
    {
      label: "Fed Funds Rate",
      value: fedFundsRate != null ? `${fedFundsRate}%` : "-",
    },
    {
      label: "Yield Curve (10Y-2Y)",
      value: yc ? `${(yc.spread as number)?.toFixed(2) ?? "-"} bps` : "-",
      note: yc?.inverted ? "INVERTED" : undefined,
      noteColor: yc?.inverted ? "text-red-600 font-bold" : undefined,
    },
    {
      label: "CPI Inflation",
      value: cpiInflation != null ? `${cpiInflation}%` : "-",
    },
    {
      label: "PCE Inflation",
      value: pceInflation != null ? `${pceInflation}%` : "-",
    },
    {
      label: "Unemployment",
      value: unemploymentRate != null ? `${unemploymentRate}%` : "-",
    },
    {
      label: "GDP Growth",
      value: gdpGrowth != null ? `${gdpGrowth}%` : "-",
    },
    {
      label: "Credit Spreads (IG)",
      value: cs ? ((cs.investmentGrade as string) || "-") : "-",
      note: (cs?.trend as string) || undefined,
    },
    {
      label: "M2 Money Supply",
      value: m2 ? ((m2.growth as string) || "-") : "-",
      note: (m2?.trend as string) || undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            Key Economic Indicators
          </CardTitle>
          <button
            onClick={() => setShowAllExplainers(!showAllExplainers)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            {showAllExplainers ? "Hide" : "What do these mean?"}
            {showAllExplainers ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {showAllExplainers && (
          <p className="text-base text-muted-foreground mt-2 leading-relaxed">
            These indicators track the health of the US economy. Click the{" "}
            <HelpCircle className="h-3.5 w-3.5 inline" /> icon on any
            indicator for a detailed explanation.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {indicators.map((ind) => (
            <IndicatorCard key={ind.label} {...ind} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
