"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      value: yc
        ? `${(yc.spread as number)?.toFixed(2) ?? "-"} bps`
        : "-",
      note: yc?.inverted ? "INVERTED" : undefined,
      noteColor: yc?.inverted ? "text-red-600" : undefined,
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
      value: cs ? (cs.investmentGrade as string || "-") : "-",
      note: cs?.trend as string || undefined,
    },
    {
      label: "M2 Money Supply",
      value: m2 ? (m2.growth as string || "-") : "-",
      note: m2?.trend as string || undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {indicators.map((ind) => (
            <div key={ind.label} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {ind.label}
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {ind.value}
              </p>
              {ind.note && (
                <p
                  className={`text-xs ${
                    ind.noteColor || "text-muted-foreground"
                  }`}
                >
                  {ind.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
