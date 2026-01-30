"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExecutiveSummaryProps {
  ticker: string;
  companyName: string;
  summary: string;
  verdict: string;
  moatType?: string;
  aiDisruptionLevel?: string;
}

export function ExecutiveSummary({
  ticker,
  companyName,
  summary,
  verdict,
  moatType,
  aiDisruptionLevel,
}: ExecutiveSummaryProps) {
  const verdictColors = {
    BUY: "success" as const,
    WATCH: "warning" as const,
    PASS: "error" as const,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {ticker} - {companyName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {moatType && (
                <Badge variant="outline">{moatType} Moat</Badge>
              )}
              {aiDisruptionLevel && (
                <Badge
                  variant={
                    aiDisruptionLevel === "Low"
                      ? "success"
                      : aiDisruptionLevel === "High" ||
                          aiDisruptionLevel === "Critical"
                        ? "error"
                        : "warning"
                  }
                >
                  AI Risk: {aiDisruptionLevel}
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant={
              verdictColors[verdict as keyof typeof verdictColors] ||
              "secondary"
            }
            size="lg"
            className="text-base px-4 py-1.5"
          >
            {verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sand-700 whitespace-pre-line leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
