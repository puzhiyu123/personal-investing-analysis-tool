"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialAnalysisProps {
  revenueGrowth: string | null;
  ownerEarnings: string | null;
  margins: string | null;
  roic: string | null;
  debtToEquity: number | null;
  freeCashFlow: string | null;
}

function parseJSON(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function FinancialAnalysis({
  revenueGrowth,
  ownerEarnings,
  margins,
  roic,
  debtToEquity,
  freeCashFlow,
}: FinancialAnalysisProps) {
  const revenue = parseJSON(revenueGrowth);
  const earnings = parseJSON(ownerEarnings);
  const marginData = parseJSON(margins);
  const roicData = parseJSON(roic);
  const fcf = parseJSON(freeCashFlow);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {revenue && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Revenue Growth
              </h4>
              <p className="text-lg font-semibold">
                {(revenue.fiveYearCAGR as number)?.toFixed(1) ??
                  revenue.trend}
                {revenue.fiveYearCAGR != null && "% CAGR (5yr)"}
              </p>
              <p className="text-xs text-muted-foreground">
                {revenue.assessment as string || revenue.trend as string}
              </p>
            </div>
          )}

          {marginData && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Margins
              </h4>
              <div className="space-y-0.5 text-sm">
                {marginData.gross != null && (
                  <p>
                    Gross: <span className="font-medium">{marginData.gross as number}%</span>
                  </p>
                )}
                {marginData.operating != null && (
                  <p>
                    Operating:{" "}
                    <span className="font-medium">{marginData.operating as number}%</span>
                  </p>
                )}
                {marginData.net != null && (
                  <p>
                    Net: <span className="font-medium">{marginData.net as number}%</span>
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {marginData.trend as string}
              </p>
            </div>
          )}

          {roicData && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                ROIC
              </h4>
              <p className="text-lg font-semibold">
                {(roicData.current as number)?.toFixed(1) ?? "-"}%
              </p>
              <p className="text-xs text-muted-foreground">
                5yr avg: {(roicData.fiveYearAvg as number)?.toFixed(1) ?? "-"}%
                {roicData.vsWacc ? ` | ${String(roicData.vsWacc)}` : null}
              </p>
            </div>
          )}

          {debtToEquity != null && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Debt/Equity
              </h4>
              <p className="text-lg font-semibold">
                {debtToEquity.toFixed(2)}
              </p>
            </div>
          )}

          {earnings && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Owner Earnings
              </h4>
              <p className="text-lg font-semibold">
                {earnings.latestValue as string || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {earnings.trend as string}
              </p>
            </div>
          )}

          {fcf && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Free Cash Flow
              </h4>
              <p className="text-lg font-semibold">{fcf.latest as string || "-"}</p>
              <p className="text-xs text-muted-foreground">
                {fcf.trend as string}
                {fcf.perShare ? ` | ${String(fcf.perShare)}/share` : null}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
