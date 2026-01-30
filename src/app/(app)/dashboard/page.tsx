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
  Radar,
  AlertTriangle,
  AlertCircle,
  FileText,
  Shield,
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
    moatType: string | null;
    overallScore: number | null;
    notesCount: number;
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
  alerts: {
    unreadCount: number;
    items: Array<{
      id: string;
      ticker: string | null;
      alertType: string;
      severity: string;
      title: string;
      description: string;
      createdAt: string;
    }>;
  };
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
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
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Your investment analysis overview
        </p>
      </div>

      {/* Alerts Banner */}
      {stats.alerts.unreadCount > 0 && (
        <Link href="/portfolio">
          <Card className="card-hover cursor-pointer border-amber-200 bg-amber-50/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-lg font-semibold text-amber-800">
                    Portfolio Alerts
                  </span>
                  <Badge variant="warning">{stats.alerts.unreadCount} unread</Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                {stats.alerts.items.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg bg-muted/60 px-3 py-2.5"
                  >
                    {alert.severity === "CRITICAL" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {alert.ticker && (
                          <Badge variant="outline" size="sm">
                            {alert.ticker}
                          </Badge>
                        )}
                        <span className="text-base font-medium text-foreground truncate">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-base font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats.portfolio.totalValue > 0
                ? formatCurrency(stats.portfolio.totalValue)
                : "No holdings"}
            </p>
            {stats.portfolio.holdingCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.portfolio.holdingCount} position{stats.portfolio.holdingCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-base font-medium text-muted-foreground flex items-center gap-2">
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
              className={`text-3xl font-semibold tabular-nums ${
                stats.portfolio.totalGainLoss >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.portfolio.totalCost > 0
                ? formatCurrency(stats.portfolio.totalGainLoss)
                : "-"}
            </p>
            {stats.portfolio.totalCost > 0 && (
              <p
                className={`text-sm mt-1 ${
                  gainLossPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPercent(gainLossPercent)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-base font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats.watchlistCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              active item{stats.watchlistCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/analyze">
          <Card className="card-hover cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="flex items-center gap-3 py-5">
              <div className="rounded-lg bg-primary-50 p-2.5">
                <Search className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-medium">Analyze Company</p>
                <p className="text-sm text-muted-foreground">
                  Buffett-style analysis
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/macro">
          <Card className="card-hover cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="flex items-center gap-3 py-5">
              <div className="rounded-lg bg-primary-50 p-2.5">
                <Globe className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-medium">Run Macro Scan</p>
                <p className="text-sm text-muted-foreground">
                  Dalio regime assessment
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/portfolio">
          <Card className="card-hover cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="flex items-center gap-3 py-5">
              <div className="rounded-lg bg-primary-50 p-2.5">
                <Radar className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-medium">Scan Portfolio</p>
                <p className="text-sm text-muted-foreground">
                  News & thesis check
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
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
                <div className="flex items-center gap-3">
                  {stats.latestMacro.riskLevel && (
                    <Badge
                      size="lg"
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <CardDescription className="text-base">
                {formatDate(stats.latestMacro.createdAt)}
              </CardDescription>
            </CardHeader>
            {stats.latestMacro.executiveSummary && (
              <CardContent>
                <p className="text-base text-foreground/80 leading-relaxed line-clamp-3">
                  {stats.latestMacro.executiveSummary}
                </p>
              </CardContent>
            )}
          </Card>
        </Link>
      )}

      {/* Recent Analyses + Recent Decisions */}
      <div className="grid gap-8 lg:grid-cols-2 mt-4">
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
              <p className="text-base text-muted-foreground">
                No analyses yet. Analyze your first company.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentAnalyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/analyze/${a.id}`}
                    className="block rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{a.ticker}</span>
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
                        {a.status === "UPDATING" && (
                          <Badge variant="warning" size="sm">
                            Updating
                          </Badge>
                        )}
                      </div>
                      {a.overallScore != null && (
                        <span
                          className={`text-lg font-bold tabular-nums ${getScoreColor(a.overallScore)}`}
                        >
                          {a.overallScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {a.companyName && (
                          <span className="truncate max-w-[180px]">{a.companyName}</span>
                        )}
                        {a.moatType && (
                          <>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {a.moatType}
                            </span>
                          </>
                        )}
                        {a.notesCount > 0 && (
                          <>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {a.notesCount}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
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
                <p className="text-base text-muted-foreground">
                  No decisions logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentDecisions.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{d.ticker}</span>
                        <Badge variant="outline" size="sm">
                          {d.action}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(d.decisionDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
                <div className="space-y-2">
                  {stats.watchlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{item.ticker}</span>
                        {item.companyName && (
                          <span className="text-sm text-muted-foreground">
                            {item.companyName}
                          </span>
                        )}
                      </div>
                      {item.reason && (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {item.reason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
