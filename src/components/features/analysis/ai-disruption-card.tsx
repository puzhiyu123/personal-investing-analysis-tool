"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";

interface AiDisruptionCardProps {
  level: string | null;
  score: number | null;
  analysis: string | null;
}

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

function RiskMeter({ level, score }: { level: string; score: number | null }) {
  const activeIndex = RISK_LEVELS.indexOf(level);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {RISK_LEVELS.map((l, i) => {
          const isActive = i <= activeIndex;
          const colors = [
            "bg-green-400",
            "bg-amber-400",
            "bg-orange-400",
            "bg-red-500",
          ];
          return (
            <div
              key={l}
              className={`h-3 flex-1 rounded-full transition-colors ${
                isActive ? colors[i] : "bg-muted"
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {RISK_LEVELS.map((l) => (
          <span
            key={l}
            className={l === level ? "font-semibold text-foreground" : ""}
          >
            {l}
          </span>
        ))}
      </div>
      {score != null && (
        <div className="flex items-center gap-2">
          <span className="text-base text-muted-foreground">
            Disruption Score:
          </span>
          <span
            className={`text-xl font-bold tabular-nums ${
              score <= 3
                ? "text-green-600"
                : score <= 5
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {score}/10
          </span>
        </div>
      )}
    </div>
  );
}

export function AiDisruptionCard({
  level,
  score,
  analysis,
}: AiDisruptionCardProps) {
  if (!level && !analysis) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-500" />
            AI Disruption
          </CardTitle>
          {level && (
            <Badge
              variant={
                level === "Low"
                  ? "success"
                  : level === "Medium"
                    ? "warning"
                    : "error"
              }
              size="lg"
            >
              {level} Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {level && <RiskMeter level={level} score={score} />}

        {analysis && (
          <p className="text-lg text-foreground/80 leading-relaxed">
            {analysis}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
