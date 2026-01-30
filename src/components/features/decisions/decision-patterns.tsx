"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionPatterns } from "@/types/decisions";

interface DecisionPatternsCardProps {
  patterns: DecisionPatterns;
}

export function DecisionPatternsCard({ patterns }: DecisionPatternsCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Decisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{patterns.total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {patterns.total > 0 ? `${patterns.accuracy}%` : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            {patterns.correct} correct / {patterns.correct + patterns.incorrect}{" "}
            decided
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{patterns.pending}</p>
          <p className="text-xs text-muted-foreground">
            Awaiting outcome
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            By Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(patterns.byAction).map(([action, count]) => (
              <div
                key={action}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{action}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
