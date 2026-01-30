"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { RegimeAssessment } from "@/components/features/macro/regime-assessment";
import { IndicatorsDashboard } from "@/components/features/macro/indicators-dashboard";
import { HistoricalAnalog } from "@/components/features/macro/historical-analog";
import { PortfolioImplications } from "@/components/features/macro/portfolio-implications";
import { ThingsToWatch } from "@/components/features/macro/things-to-watch";
import { AnalysisProgress } from "@/components/features/analysis/analysis-progress";
import type { MacroReportData } from "@/types/macro";

export default function MacroReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<MacroReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/macro/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
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
    <div className="space-y-6">
      <Link
        href="/macro"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to macro scans
      </Link>

      {report.status !== "COMPLETE" && (
        <AnalysisProgress status={report.status} />
      )}

      {report.status === "COMPLETE" && (
        <>
          {report.executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sand-700 whitespace-pre-line leading-relaxed">
                  {report.executiveSummary}
                </p>
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
        </>
      )}
    </div>
  );
}
