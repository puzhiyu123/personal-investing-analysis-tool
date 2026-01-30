"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Landmark,
} from "lucide-react";

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

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h4 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </h4>
      </div>
      {children}
    </div>
  );
}

function MarginBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const width = Math.min(Math.max(value, 0), 100);
  const color =
    value >= 30 ? "bg-green-500" : value >= 15 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-base text-muted-foreground">{label}</span>
        <span className="text-base font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
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
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary-500" />
          Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {revenue && (
            <MetricCard
              icon={TrendingUp}
              iconColor="text-green-500"
              label="Revenue Growth"
            >
              <p className="text-3xl font-bold tabular-nums">
                {revenue.fiveYearCAGR != null
                  ? Number(revenue.fiveYearCAGR).toFixed(1)
                  : revenue.trend}
                {revenue.fiveYearCAGR != null && "%"}
              </p>
              {revenue.fiveYearCAGR != null && (
                <p className="text-base text-muted-foreground">
                  5-year CAGR
                </p>
              )}
              <p className="text-base text-muted-foreground">
                {(revenue.assessment as string) ||
                  (revenue.trend as string)}
              </p>
            </MetricCard>
          )}

          {marginData && (
            <MetricCard
              icon={PieChart}
              iconColor="text-blue-500"
              label="Margins"
            >
              <div className="space-y-2.5">
                {marginData.gross != null && (
                  <MarginBar
                    label="Gross"
                    value={marginData.gross as number}
                  />
                )}
                {marginData.operating != null && (
                  <MarginBar
                    label="Operating"
                    value={marginData.operating as number}
                  />
                )}
                {marginData.net != null && (
                  <MarginBar
                    label="Net"
                    value={marginData.net as number}
                  />
                )}
              </div>
              {!!marginData.trend && (
                <p className="text-sm text-muted-foreground mt-1">
                  {String(marginData.trend)}
                </p>
              )}
            </MetricCard>
          )}

          {roicData && (
            <MetricCard
              icon={TrendingUp}
              iconColor="text-teal-500"
              label="ROIC"
            >
              <p className="text-3xl font-bold tabular-nums">
                {roicData.current != null ? Number(roicData.current).toFixed(1) : "-"}%
              </p>
              <p className="text-base text-muted-foreground">
                5yr avg:{" "}
                {roicData.fiveYearAvg != null ? Number(roicData.fiveYearAvg).toFixed(1) : "-"}%
              </p>
              {roicData.vsWacc != null && (
                <p className="text-base text-muted-foreground">
                  {String(roicData.vsWacc)}
                </p>
              )}
            </MetricCard>
          )}

          {debtToEquity != null && (
            <MetricCard
              icon={Landmark}
              iconColor="text-purple-500"
              label="Debt / Equity"
            >
              <p
                className={`text-2xl font-bold tabular-nums ${
                  debtToEquity <= 0.5
                    ? "text-green-600"
                    : debtToEquity <= 1.5
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {debtToEquity.toFixed(2)}
              </p>
              <p className="text-base text-muted-foreground">
                {debtToEquity <= 0.5
                  ? "Conservative leverage"
                  : debtToEquity <= 1.5
                    ? "Moderate leverage"
                    : "High leverage"}
              </p>
            </MetricCard>
          )}

          {earnings && (
            <MetricCard
              icon={DollarSign}
              iconColor="text-green-600"
              label="Owner Earnings"
            >
              <p className="text-3xl font-bold tabular-nums">
                {(earnings.latestValue as string) || "-"}
              </p>
              {!!earnings.trend && (
                <p className="text-base text-muted-foreground">
                  {String(earnings.trend)}
                </p>
              )}
            </MetricCard>
          )}

          {fcf && (
            <MetricCard
              icon={
                String(fcf.trend)
                  .toLowerCase()
                  .includes("declin")
                  ? TrendingDown
                  : TrendingUp
              }
              iconColor={
                String(fcf.trend)
                  .toLowerCase()
                  .includes("declin")
                  ? "text-red-500"
                  : "text-green-500"
              }
              label="Free Cash Flow"
            >
              <p className="text-3xl font-bold tabular-nums">
                {(fcf.latest as string) || "-"}
              </p>
              {!!fcf.perShare && (
                <p className="text-base text-muted-foreground">
                  {String(fcf.perShare)}/share
                </p>
              )}
              {!!fcf.trend && (
                <p className="text-base text-muted-foreground">
                  {String(fcf.trend)}
                </p>
              )}
            </MetricCard>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
