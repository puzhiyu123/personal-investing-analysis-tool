"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface WatchItem {
  indicator: string;
  threshold: string;
  currentValue: string;
  significance: string;
}

interface ThingsToWatchProps {
  items: string | null;
}

function parseItems(json: string | null): WatchItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ThingsToWatch({ items }: ThingsToWatchProps) {
  const watchItems = parseItems(items);
  if (watchItems.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Eye className="h-5 w-5 text-primary-500" />
          Things to Watch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {watchItems.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/50 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h4 className="text-xl font-semibold text-foreground">
                  {item.indicator}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-base tabular-nums font-medium text-foreground">
                    Current: {item.currentValue}
                  </span>
                  <span className="text-base tabular-nums text-muted-foreground">
                    Threshold: {item.threshold}
                  </span>
                </div>
              </div>
              <p className="text-lg text-foreground/80 leading-relaxed">
                {item.significance}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
