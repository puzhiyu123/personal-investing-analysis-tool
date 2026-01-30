"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MacroTrigger } from "@/components/features/macro/macro-trigger";
import { formatDate } from "@/lib/utils";

interface MacroReportSummary {
  id: string;
  status: string;
  reportDate: string;
  riskLevel: string | null;
  executiveSummary: string | null;
  createdAt: string;
}

const RISK_COLORS: Record<string, string> = {
  Low: "success",
  Moderate: "warning",
  Elevated: "warning",
  High: "error",
  Critical: "error",
};

export default function MacroPage() {
  const [reports, setReports] = useState<MacroReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/macro");
      if (res.ok) setReports(await res.json());
    } catch (error) {
      console.error("Error fetching macro reports:", error);
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
          Macro Analysis
        </h1>
        <p className="mt-1 text-muted-foreground">
          Dalio-style regime assessment and cycle positioning
        </p>
      </div>

      <MacroTrigger />

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/macro/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      Macro Scan - {formatDate(r.reportDate)}
                    </span>
                    {r.status === "IN_PROGRESS" && (
                      <Badge variant="warning">In Progress</Badge>
                    )}
                    {r.status === "FAILED" && (
                      <Badge variant="error">Failed</Badge>
                    )}
                    {r.riskLevel && (
                      <Badge
                        variant={
                          (RISK_COLORS[r.riskLevel] as
                            | "success"
                            | "warning"
                            | "error") || "secondary"
                        }
                      >
                        {r.riskLevel} Risk
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
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
