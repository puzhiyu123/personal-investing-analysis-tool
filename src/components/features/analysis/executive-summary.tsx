"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Cpu, CheckCircle, Eye, XCircle } from "lucide-react";

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
  const verdictConfig = {
    BUY: {
      variant: "success" as const,
      icon: CheckCircle,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    WATCH: {
      variant: "warning" as const,
      icon: Eye,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    PASS: {
      variant: "error" as const,
      icon: XCircle,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
    },
  };

  const config =
    verdictConfig[verdict as keyof typeof verdictConfig] ?? verdictConfig.WATCH;
  const VerdictIcon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              {ticker}
            </h1>
            <p className="text-xl text-muted-foreground mt-0.5">
              {companyName}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {moatType && (
                <Badge variant="outline" size="lg" className="gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {moatType} Moat
                </Badge>
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
                  size="lg"
                  className="gap-1"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  AI Risk: {aiDisruptionLevel}
                </Badge>
              )}
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 ${config.bg} ${config.border}`}
          >
            <VerdictIcon className={`h-6 w-6 ${config.text}`} />
            <span className={`text-2xl font-bold ${config.text}`}>
              {verdict}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-foreground/80 whitespace-pre-line leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
