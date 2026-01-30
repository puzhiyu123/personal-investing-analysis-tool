"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, BookOpen, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegimeAssessment } from "@/components/features/macro/regime-assessment";
import { IndicatorsDashboard } from "@/components/features/macro/indicators-dashboard";
import { HistoricalAnalog } from "@/components/features/macro/historical-analog";
import { PortfolioImplications } from "@/components/features/macro/portfolio-implications";
import { ThingsToWatch } from "@/components/features/macro/things-to-watch";
import { MacroChat } from "@/components/features/macro/macro-chat";
import { SimplifiedReport } from "@/components/features/macro/simplified-report";
import { AnalysisProgress } from "@/components/features/analysis/analysis-progress";
import { formatDate } from "@/lib/utils";
import type { MacroReportData } from "@/types/macro";

export default function MacroReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<MacroReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Easy Read state
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifyError, setSimplifyError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/macro/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        // Pre-populate cached simplified report if available
        if (data.simplifiedReport) {
          setSimplifiedText(data.simplifiedReport);
        }
        if (data.status === "IN_PROGRESS") {
          setTimeout(fetchData, 5000);
        }
      }
    } catch (error) {
      console.error("Error fetching macro report:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchSimplified = useCallback(async () => {
    setIsSimplifying(true);
    setSimplifyError(null);
    try {
      const res = await fetch("/api/macro/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate simplified report");
      }
      const data = await res.json();
      setSimplifiedText(data.simplified);
    } catch (error) {
      console.error("Error simplifying report:", error);
      setSimplifyError("Something went wrong generating the simplified report.");
    } finally {
      setIsSimplifying(false);
    }
  }, [id]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "easy" && simplifiedText === null && !isSimplifying) {
        fetchSimplified();
      }
    },
    [simplifiedText, isSimplifying, fetchSimplified]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Report not found.
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/macro"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to macro scans
        </Link>
        {report.status === "COMPLETE" && (
          <span className="text-sm text-muted-foreground">
            {formatDate(report.createdAt)}
          </span>
        )}
      </div>

      {report.status === "FAILED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-10 text-center space-y-4">
            <p className="text-lg text-red-700 font-semibold">Macro scan failed</p>
            <p className="text-base text-red-600">
              The analysis encountered an error. You can try running a new scan.
            </p>
            <Link
              href="/macro"
              className="inline-flex items-center gap-1.5 text-base font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Macro — Run New Scan
            </Link>
          </CardContent>
        </Card>
      )}

      {report.status === "IN_PROGRESS" && (
        <AnalysisProgress status={report.status} />
      )}

      {report.status === "COMPLETE" && (
        <Tabs defaultValue="financial" onValueChange={handleTabChange}>
          {/* Page title with tabs and risk badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-4xl text-foreground">
                Macro Report
              </h1>
              <TabsList>
                <TabsTrigger value="financial" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="easy" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Easy Read
                </TabsTrigger>
              </TabsList>
            </div>
            {report.riskLevel && (
              <Badge
                variant={
                  (
                    {
                      Low: "success",
                      Moderate: "warning",
                      Elevated: "warning",
                      High: "error",
                      Critical: "error",
                    } as Record<string, "success" | "warning" | "error">
                  )[report.riskLevel] || "secondary"
                }
                size="lg"
              >
                {report.riskLevel} Risk
              </Badge>
            )}
          </div>

          <TabsContent value="financial" className="space-y-10 mt-10">
            {report.executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg text-foreground/85 leading-8">
                    {report.executiveSummary.split("\n\n").map((para, i) => (
                      <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <RegimeAssessment
              shortTermDebtCycle={report.shortTermDebtCycle}
              longTermDebtCycle={report.longTermDebtCycle}
              businessCycle={report.businessCycle}
              riskLevel={report.riskLevel}
            />

            <IndicatorsDashboard
              fedFundsRate={report.fedFundsRate}
              yieldCurve={report.yieldCurve}
              cpiInflation={report.cpiInflation}
              pceInflation={report.pceInflation}
              unemploymentRate={report.unemploymentRate}
              gdpGrowth={report.gdpGrowth}
              creditSpreads={report.creditSpreads}
              m2MoneySupply={report.m2MoneySupply}
            />

            <HistoricalAnalog
              period={report.historicalAnalogPeriod}
              description={report.historicalAnalogDescription}
              similarities={report.historicalAnalogSimilarities}
              differences={report.historicalAnalogDifferences}
            />

            <PortfolioImplications
              implications={report.portfolioImplications}
            />

            <ThingsToWatch items={report.thingsToWatch} />

            <MacroChat reportId={id} />
          </TabsContent>

          <TabsContent value="easy" className="mt-10">
            {isSimplifying && (
              <Card>
                <CardContent className="py-16 text-center space-y-4">
                  <Spinner size="lg" />
                  <p className="text-lg text-muted-foreground">
                    Generating plain-language summary...
                  </p>
                </CardContent>
              </Card>
            )}

            {simplifyError && !isSimplifying && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-10 text-center space-y-4">
                  <p className="text-lg text-red-700 font-semibold">
                    Failed to generate summary
                  </p>
                  <p className="text-base text-red-600">{simplifyError}</p>
                  <button
                    onClick={fetchSimplified}
                    className="inline-flex items-center gap-1.5 text-base font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </CardContent>
              </Card>
            )}

            {simplifiedText && !isSimplifying && (
              <SimplifiedReport content={simplifiedText} />
            )}

            {simplifiedText && !isSimplifying && (
              <MacroChat reportId={id} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
