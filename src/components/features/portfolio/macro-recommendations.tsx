"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Globe, ArrowRight } from "lucide-react";

interface MacroImplication {
  action: string;
  assetClass: string;
  conviction: string;
  reasoning: string;
}

interface MacroReportSummary {
  id: string;
  status: string;
  portfolioImplications: string | null;
}

export function MacroRecommendations() {
  const [implications, setImplications] = useState<MacroImplication[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMacro() {
      try {
        const res = await fetch("/api/macro");
        if (!res.ok) return;

        const reports: MacroReportSummary[] = await res.json();
        const latest = reports.find((r) => r.status === "COMPLETE");
        if (!latest) return;

        setReportId(latest.id);

        // Fetch the full report to get portfolioImplications
        const detailRes = await fetch(`/api/macro/${latest.id}`);
        if (!detailRes.ok) return;

        const detail = await detailRes.json();
        if (detail.portfolioImplications) {
          try {
            const parsed = JSON.parse(detail.portfolioImplications);
            if (Array.isArray(parsed)) setImplications(parsed);
          } catch {
            // skip malformed data
          }
        }
      } catch (error) {
        console.error("Error fetching macro data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMacro();
  }, []);

  if (isLoading) return null;
  if (implications.length === 0) return null;

  const convictionColor = (conviction: string) => {
    switch (conviction.toLowerCase()) {
      case "high":
        return "success";
      case "medium":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary-500" />
            Macro Signals
          </CardTitle>
          {reportId && (
            <Link href={`/macro/${reportId}`}>
              <Button variant="ghost" size="sm">
                Full report
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {implications.map((imp, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-medium text-foreground">
                  {imp.action}
                </p>
                <Badge variant="outline">{imp.assetClass}</Badge>
                <Badge
                  variant={convictionColor(imp.conviction) as "success" | "warning" | "secondary"}
                >
                  {imp.conviction}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {imp.reasoning}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
