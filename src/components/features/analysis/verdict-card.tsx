"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
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

  const verdictConfig = {
    BUY: {
      icon: CheckCircle,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "BUY",
    },
    WATCH: {
      icon: Eye,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "WATCH",
    },
    PASS: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "PASS",
    },
  };

  const config = verdict
    ? verdictConfig[verdict as keyof typeof verdictConfig] ??
      verdictConfig.WATCH
    : null;
  const VerdictIcon = config?.icon ?? Eye;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VerdictIcon
            className={`h-5 w-5 ${config?.color ?? "text-muted-foreground"}`}
          />
          Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {verdict && config && (
          <div
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${config.bg} ${config.border}`}
          >
            <VerdictIcon className={`h-7 w-7 ${config.color}`} />
            <div>
              <p className={`text-2xl font-bold ${config.color}`}>
                {config.label}
              </p>
              {reasoning && (
                <p className="text-lg text-foreground/80 mt-1 leading-relaxed">
                  {reasoning}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {risks.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-4">
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                Key Risks
              </h4>
              <ul className="space-y-2.5">
                {risks.map((risk, i) => (
                  <li
                    key={i}
                    className="text-lg text-foreground/80 flex gap-2.5"
                  >
                    <span className="text-red-400 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {catalysts.length > 0 && (
            <div className="rounded-xl border border-green-100 bg-green-50/30 p-4">
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Rocket className="h-4.5 w-4.5 text-green-500" />
                Key Catalysts
              </h4>
              <ul className="space-y-2.5">
                {catalysts.map((catalyst, i) => (
                  <li
                    key={i}
                    className="text-lg text-foreground/80 flex gap-2.5"
                  >
                    <span className="text-green-400 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
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
