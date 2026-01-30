"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CyclePosition {
  position: string;
  description: string;
  phase?: string;
}

interface RegimeAssessmentProps {
  shortTermDebtCycle: string | null;
  longTermDebtCycle: string | null;
  businessCycle: string | null;
  riskLevel: string | null;
}

function parseCycle(json: string | null): CyclePosition | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const RISK_COLORS: Record<string, string> = {
  Low: "success",
  Moderate: "warning",
  Elevated: "warning",
  High: "error",
  Critical: "error",
};

export function RegimeAssessment({
  shortTermDebtCycle,
  longTermDebtCycle,
  businessCycle,
  riskLevel,
}: RegimeAssessmentProps) {
  const shortTerm = parseCycle(shortTermDebtCycle);
  const longTerm = parseCycle(longTermDebtCycle);
  const business = parseCycle(businessCycle);

  const cycles = [
    { label: "Short-Term Debt Cycle", data: shortTerm },
    { label: "Long-Term Debt Cycle", data: longTerm },
    { label: "Business Cycle", data: business },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Regime Assessment</CardTitle>
          {riskLevel && (
            <Badge
              variant={
                (RISK_COLORS[riskLevel] as "success" | "warning" | "error") ||
                "secondary"
              }
              size="lg"
            >
              Risk: {riskLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {cycles.map(({ label, data }) => (
            <div
              key={label}
              className="rounded-lg border border-sand-200 p-4"
            >
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </h4>
              {data ? (
                <>
                  <p className="mt-1 font-semibold text-foreground">
                    {data.position}
                  </p>
                  {data.phase && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      {data.phase.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {data.description}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  No data
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
