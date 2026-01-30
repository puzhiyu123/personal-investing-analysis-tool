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
    return JSON.parse(json);
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
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary-500" />
          Things to Watch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Indicator</th>
                <th className="pb-2 pr-4 font-medium">Current</th>
                <th className="pb-2 pr-4 font-medium">Threshold</th>
                <th className="pb-2 font-medium">Significance</th>
              </tr>
            </thead>
            <tbody>
              {watchItems.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-sand-100"
                >
                  <td className="py-2 pr-4 font-medium">
                    {item.indicator}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {item.currentValue}
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                    {item.threshold}
                  </td>
                  <td className="py-2 text-muted-foreground text-xs">
                    {item.significance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
