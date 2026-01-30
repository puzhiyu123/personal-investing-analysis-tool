"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface BuffettScoreProps {
  businessQuality: number | null;
  management: number | null;
  financialStrength: number | null;
  valuation: number | null;
  moatDurability: number | null;
}

function getColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-amber-500";
  return "bg-red-400";
}

function getTextColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
}

function ScoreRow({
  name,
  score,
  weight,
}: {
  name: string;
  score: number;
  weight: string;
}) {
  const percentage = (score / 10) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-foreground">{name}</span>
          <span className="text-sm text-muted-foreground">({weight})</span>
        </div>
        <span className={`text-xl font-bold tabular-nums ${getTextColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted">
        <div
          className={`h-2.5 rounded-full ${getColor(score)} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function BuffettScore({
  businessQuality,
  management,
  financialStrength,
  valuation,
  moatDurability,
}: BuffettScoreProps) {
  const data = [
    { name: "Business Quality", score: businessQuality ?? 0, weight: "25%" },
    { name: "Management", score: management ?? 0, weight: "15%" },
    { name: "Financial Strength", score: financialStrength ?? 0, weight: "20%" },
    { name: "Valuation", score: valuation ?? 0, weight: "25%" },
    { name: "Moat Durability", score: moatDurability ?? 0, weight: "15%" },
  ];

  const overall =
    (businessQuality ?? 0) * 0.25 +
    (management ?? 0) * 0.15 +
    (financialStrength ?? 0) * 0.2 +
    (valuation ?? 0) * 0.25 +
    (moatDurability ?? 0) * 0.15;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-500" />
            Buffett Scores
          </CardTitle>
          <div
            className={`flex items-center gap-1 rounded-xl border px-4 py-2 ${
              overall >= 7
                ? "border-green-200 bg-green-50"
                : overall >= 5
                  ? "border-amber-200 bg-amber-50"
                  : "border-red-200 bg-red-50"
            }`}
          >
            <span className="text-sm text-muted-foreground">Overall</span>
            <span
              className={`text-3xl font-bold tabular-nums ${getTextColor(overall)}`}
            >
              {overall.toFixed(1)}
            </span>
            <span className="text-base text-muted-foreground">/10</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((d) => (
            <ScoreRow
              key={d.name}
              name={d.name}
              score={d.score}
              weight={d.weight}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
