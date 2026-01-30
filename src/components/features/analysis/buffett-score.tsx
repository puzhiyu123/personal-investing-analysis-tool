"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BuffettScoreProps {
  businessQuality: number | null;
  management: number | null;
  financialStrength: number | null;
  valuation: number | null;
  moatDurability: number | null;
}

function getColor(score: number): string {
  if (score >= 7) return "#0d9488";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
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
          <CardTitle>Buffett Scores</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall:</span>
            <span
              className={`text-2xl font-bold ${
                overall >= 7
                  ? "text-green-600"
                  : overall >= 5
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {overall.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
            <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}/10`, "Score"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e8e4de",
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
          {data.map((d) => (
            <div key={d.name}>
              <span className="font-medium">{d.weight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
