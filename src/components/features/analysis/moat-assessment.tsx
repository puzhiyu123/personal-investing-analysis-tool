"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MoatAssessmentProps {
  moatType: string | null;
  moatScore: number | null;
  moatEvidence: string | null;
  moatThreats: string | null;
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

function ScoreBar({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  const color =
    score >= 7 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 rounded-full bg-muted">
        <div
          className={`h-3 rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-xl font-bold tabular-nums ${
          score >= 7
            ? "text-green-600"
            : score >= 5
              ? "text-amber-600"
              : "text-red-600"
        }`}
      >
        {score}/10
      </span>
    </div>
  );
}

export function MoatAssessment({
  moatType,
  moatScore,
  moatEvidence,
  moatThreats,
}: MoatAssessmentProps) {
  const evidence = parseArray(moatEvidence);
  const threats = parseArray(moatThreats);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            Moat Assessment
          </CardTitle>
          {moatType && (
            <Badge variant="outline" size="lg">
              {moatType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {moatScore != null && <ScoreBar score={moatScore} />}

        {evidence.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Evidence
            </h4>
            <ul className="space-y-2">
              {evidence.map((item, i) => (
                <li
                  key={i}
                  className="text-lg text-foreground/80 flex gap-2.5 rounded-lg bg-green-50/50 px-3 py-2"
                >
                  <span className="text-green-500 shrink-0 font-bold">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {threats.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Threats
            </h4>
            <ul className="space-y-2">
              {threats.map((item, i) => (
                <li
                  key={i}
                  className="text-lg text-foreground/80 flex gap-2.5 rounded-lg bg-red-50/50 px-3 py-2"
                >
                  <span className="text-red-500 shrink-0 font-bold">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
