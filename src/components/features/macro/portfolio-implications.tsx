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
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
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
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Portfolio Implications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/50 p-5"
            >
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-xl font-semibold text-foreground">
                  {item.action}
                </span>
                <Badge variant="outline">
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
                >
                  {item.conviction} conviction
                </Badge>
              </div>
              <div className="text-lg text-foreground/80 leading-relaxed">
                {item.reasoning.split("\n\n").map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
