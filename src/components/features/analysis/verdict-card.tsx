"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, XCircle, AlertTriangle, Rocket } from "lucide-react";

interface VerdictCardProps {
  verdict: string | null;
  reasoning: string | null;
  keyRisks: string | null;
  keyCatalysts: string | null;
}

function parseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function VerdictCard({
  verdict,
  reasoning,
  keyRisks,
  keyCatalysts,
}: VerdictCardProps) {
  const risks = parseArray(keyRisks);
  const catalysts = parseArray(keyCatalysts);

  const VerdictIcon =
    verdict === "BUY"
      ? CheckCircle
      : verdict === "WATCH"
        ? Eye
        : XCircle;

  const verdictColor =
    verdict === "BUY"
      ? "text-green-600"
      : verdict === "WATCH"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verdict</CardTitle>
          {verdict && (
            <div className="flex items-center gap-2">
              <VerdictIcon className={`h-5 w-5 ${verdictColor}`} />
              <Badge
                variant={
                  verdict === "BUY"
                    ? "success"
                    : verdict === "WATCH"
                      ? "warning"
                      : "error"
                }
                size="lg"
              >
                {verdict}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reasoning && (
          <p className="text-sm text-sand-700 leading-relaxed">
            {reasoning}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {risks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                Key Risks
              </h4>
              <ul className="space-y-1">
                {risks.map((risk, i) => (
                  <li
                    key={i}
                    className="text-sm text-sand-700 flex gap-2"
                  >
                    <span className="text-red-400 shrink-0">&bull;</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {catalysts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Rocket className="h-3.5 w-3.5 text-green-500" />
                Key Catalysts
              </h4>
              <ul className="space-y-1">
                {catalysts.map((catalyst, i) => (
                  <li
                    key={i}
                    className="text-sm text-sand-700 flex gap-2"
                  >
                    <span className="text-green-400 shrink-0">&bull;</span>
                    {catalyst}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
