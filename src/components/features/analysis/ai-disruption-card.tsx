"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";

interface AiDisruptionCardProps {
  level: string | null;
  score: number | null;
  analysis: string | null;
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
            AI Disruption Assessment
          </CardTitle>
          <div className="flex items-center gap-2">
            {level && (
              <Badge
                variant={
                  level === "Low"
                    ? "success"
                    : level === "Medium"
                      ? "warning"
                      : "error"
                }
              >
                {level} Risk
              </Badge>
            )}
            {score != null && (
              <Badge variant="outline">{score}/10</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {analysis && (
          <p className="text-sm text-sand-700 leading-relaxed">
            {analysis}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
