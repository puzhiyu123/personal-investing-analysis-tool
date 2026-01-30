"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface HistoricalAnalogProps {
  period: string | null;
  description: string | null;
  similarities: string | null;
  differences: string | null;
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

export function HistoricalAnalog({
  period,
  description,
  similarities,
  differences,
}: HistoricalAnalogProps) {
  if (!period) return null;

  const sims = parseArray(similarities);
  const diffs = parseArray(differences);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Clock className="h-5 w-5 text-primary-500" />
          Historical Analog: {period}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {description && (
          <div className="text-lg text-foreground/85 leading-relaxed">
            {description.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
            ))}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {sims.length > 0 && (
            <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-5">
              <h4 className="text-base font-semibold text-foreground mb-3">
                Similarities
              </h4>
              <ul className="space-y-2.5">
                {sims.map((s, i) => (
                  <li key={i} className="text-lg text-foreground/80 flex gap-3 leading-relaxed">
                    <span className="text-primary-500 shrink-0 text-lg">=</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diffs.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
              <h4 className="text-base font-semibold text-foreground mb-3">
                Differences
              </h4>
              <ul className="space-y-2.5">
                {diffs.map((d, i) => (
                  <li key={i} className="text-lg text-foreground/80 flex gap-3 leading-relaxed">
                    <span className="text-amber-500 shrink-0 text-lg">&ne;</span>
                    {d}
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
