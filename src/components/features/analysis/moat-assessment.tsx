"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

interface MoatAssessmentProps {
  moatType: string | null;
  moatScore: number | null;
  moatEvidence: string | null;
  moatThreats: string | null;
}

function parseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
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
          <div className="flex items-center gap-2">
            {moatType && <Badge variant="outline">{moatType}</Badge>}
            {moatScore != null && (
              <Badge
                variant={
                  moatScore >= 7
                    ? "success"
                    : moatScore >= 5
                      ? "warning"
                      : "error"
                }
              >
                {moatScore}/10
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {evidence.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              Evidence
            </h4>
            <ul className="space-y-1">
              {evidence.map((item, i) => (
                <li key={i} className="text-sm text-sand-700 flex gap-2">
                  <span className="text-primary-500 shrink-0">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {threats.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Threats
            </h4>
            <ul className="space-y-1">
              {threats.map((item, i) => (
                <li key={i} className="text-sm text-sand-700 flex gap-2">
                  <span className="text-red-500 shrink-0">-</span>
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
