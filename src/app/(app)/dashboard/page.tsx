"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  Globe,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

interface DashboardStats {
  portfolio: {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    holdingCount: number;
  };
  recentAnalyses: Array<{
    id: string;
    ticker: string;
    companyName: string;
    status: string;
    verdict: string | null;
    createdAt: string;
  }>;
  latestMacro: {
    id: string;
    riskLevel: string | null;
    executiveSummary: string | null;
    createdAt: string;
  } | null;
  watchlistCount: number;
  watchlistItems: Array<{
    id: string;
    ticker: string;
    companyName: string;
    reason: string | null;
    status: string;
  }>;
  recentDecisions: Array<{
    id: string;
    ticker: string;
    action: string;
    thesis: string | null;
    decisionDate: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Error fetching dashboard:", error);
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

  if (!stats) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const gainLossPercent =
    stats.portfolio.totalCost > 0
      ? (stats.portfolio.totalGainLoss / stats.portfolio.totalCost) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your investment analysis overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/analyze">
          <Card className="card-hover cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="flex items-center gap-3 py-4">
              <Search className="h-5 w-5 text-primary-500" />
              <div>
                <p className="font-medium">Analyze Company</p>
                <p className="text-xs text-muted-foreground">
                  Buffett-style analysis
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/macro">
          <Card className="card-hover cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="flex items-center gap-3 py-4">
              <Globe className="h-5 w-5 text-primary-500" />
              <div>
                <p className="font-medium">Run Macro Scan</p>
                <p className="text-xs text-muted-foreground">
                  Dalio regime assessment
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {stats.portfolio.totalValue > 0
                ? formatCurrency(stats.portfolio.totalValue)
                : "No holdings"}
            </p>
            {stats.portfolio.holdingCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.portfolio.holdingCount} positions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {stats.portfolio.totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                stats.portfolio.totalGainLoss >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.portfolio.totalCost > 0
                ? `${formatCurrency(stats.portfolio.totalGainLoss)} (${formatPercent(gainLossPercent)})`
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {stats.watchlistCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              active items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Macro Regime */}
      {stats.latestMacro && (
        <Link href={`/macro/${stats.latestMacro.id}`}>
          <Card className="card-hover cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary-500" />
                  Latest Macro Regime
                </CardTitle>
                {stats.latestMacro.riskLevel && (
                  <Badge
                    variant={
                      stats.latestMacro.riskLevel === "Low"
                        ? "success"
                        : stats.latestMacro.riskLevel === "High" ||
                            stats.latestMacro.riskLevel === "Critical"
                          ? "error"
                          : "warning"
                    }
                  >
                    {stats.latestMacro.riskLevel} Risk
                  </Badge>
                )}
              </div>
              <CardDescription>
                {formatDate(stats.latestMacro.createdAt)}
              </CardDescription>
            </CardHeader>
            {stats.latestMacro.executiveSummary && (
              <CardContent>
                <p className="text-sm text-sand-700 line-clamp-3">
                  {stats.latestMacro.executiveSummary}
                </p>
              </CardContent>
            )}
          </Card>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              <Link href="/analyze">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentAnalyses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analyses yet. Analyze your first company.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentAnalyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/analyze/${a.id}`}
                    className="flex items-center justify-between rounded-lg border border-sand-100 p-3 hover:bg-sand-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.ticker}</span>
                      {a.verdict && (
                        <Badge
                          variant={
                            a.verdict === "BUY"
                              ? "success"
                              : a.verdict === "WATCH"
                                ? "warning"
                                : "error"
                          }
                          size="sm"
                        >
                          {a.verdict}
                        </Badge>
                      )}
                      {a.status === "IN_PROGRESS" && (
                        <Badge variant="warning" size="sm">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Decisions</CardTitle>
              <Link href="/decisions">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentDecisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No decisions logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentDecisions.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-sand-100 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{d.ticker}</span>
                      <Badge variant="outline" size="sm">
                        {d.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.decisionDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Preview */}
      {stats.watchlistItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Watchlist</CardTitle>
              <Link href="/watchlist">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.watchlistItems.map((item) => (
                <Badge key={item.id} variant="outline" size="lg">
                  {item.ticker}
                  {item.companyName && ` - ${item.companyName}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
