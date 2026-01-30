"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { RebalancingSuggestion } from "@/types/portfolio";

interface RebalanceAlertProps {
  suggestions: RebalancingSuggestion[];
}

export function RebalanceAlert({ suggestions }: RebalanceAlertProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Rebalancing Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s.assetType}
              className="flex items-start gap-3 rounded-lg bg-white/60 p-3"
            >
              {s.action === "INCREASE" ? (
                <TrendingUp className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <TrendingDown className="mt-0.5 h-4 w-4 text-red-600 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-sand-900">
                  {s.message}
                </p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline" size="sm">
                    Current: {s.currentPercent.toFixed(1)}%
                  </Badge>
                  <Badge variant="outline" size="sm">
                    Target: {s.targetPercent}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
