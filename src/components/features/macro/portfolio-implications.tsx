"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface Implication {
  action: string;
  assetClass: string;
  reasoning: string;
  conviction: string;
}

interface PortfolioImplicationsProps {
  implications: string | null;
}

function parseImplications(json: string | null): Implication[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function PortfolioImplications({
  implications,
}: PortfolioImplicationsProps) {
  const items = parseImplications(implications);
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Portfolio Implications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-sand-200 p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {item.action}
                </span>
                <Badge variant="outline" size="sm">
                  {item.assetClass}
                </Badge>
                <Badge
                  variant={
                    item.conviction === "high"
                      ? "success"
                      : item.conviction === "medium"
                        ? "warning"
                        : "secondary"
                  }
                  size="sm"
                >
                  {item.conviction} conviction
                </Badge>
              </div>
              <p className="text-sm text-sand-700">{item.reasoning}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
