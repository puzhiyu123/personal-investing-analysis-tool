"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AnalysisForm } from "@/components/features/analysis/analysis-form";
import { formatDate } from "@/lib/utils";

interface AnalysisSummary {
  id: string;
  ticker: string;
  companyName: string;
  status: string;
  verdict: string | null;
  executiveSummary: string | null;
  moatType: string | null;
  aiDisruptionLevel: string | null;
  createdAt: string;
}

export default function AnalyzePage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/analyze");
      if (res.ok) setAnalyses(await res.json());
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-foreground">
          Company Analysis
        </h1>
        <p className="mt-1 text-muted-foreground">
          Buffett-style analysis powered by AI research
        </p>
      </div>

      <AnalysisForm />

      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyses.map((a) => (
                <Link
                  key={a.id}
                  href={`/analyze/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">
                      {a.ticker}
                    </span>
                    {a.companyName && (
                      <span className="text-sm text-muted-foreground">
                        {a.companyName}
                      </span>
                    )}
                    {a.status === "IN_PROGRESS" && (
                      <Badge variant="warning">In Progress</Badge>
                    )}
                    {a.status === "FAILED" && (
                      <Badge variant="error">Failed</Badge>
                    )}
                    {a.verdict && (
                      <Badge
                        variant={
                          a.verdict === "BUY"
                            ? "success"
                            : a.verdict === "WATCH"
                              ? "warning"
                              : "error"
                        }
                      >
                        {a.verdict}
                      </Badge>
                    )}
                    {a.moatType && (
                      <Badge variant="outline" size="sm">
                        {a.moatType}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(a.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
