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
    return JSON.parse(json);
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" />
          Historical Analog: {period}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-sand-700 leading-relaxed">
            {description}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {sims.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Similarities
              </h4>
              <ul className="space-y-1">
                {sims.map((s, i) => (
                  <li key={i} className="text-sm text-sand-700 flex gap-2">
                    <span className="text-primary-500 shrink-0">=</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diffs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Differences
              </h4>
              <ul className="space-y-1">
                {diffs.map((d, i) => (
                  <li key={i} className="text-sm text-sand-700 flex gap-2">
                    <span className="text-amber-500 shrink-0">&ne;</span>
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
