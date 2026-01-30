"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { HoldingsTable } from "@/components/features/portfolio/holdings-table";
import { AllocationChart } from "@/components/features/portfolio/allocation-chart";
import { AddHoldingForm } from "@/components/features/portfolio/add-holding-form";
import { RebalanceAlert } from "@/components/features/portfolio/rebalance-alert";
import { PortfolioAlerts } from "@/components/features/portfolio/portfolio-alerts";
import { ScanButton } from "@/components/features/portfolio/scan-button";
import { MacroRecommendations } from "@/components/features/portfolio/macro-recommendations";
import { formatCurrency } from "@/lib/utils";
import type {
  AllocationEntry,
  RebalancingSuggestion,
  PortfolioAlertData,
} from "@/types/portfolio";

interface Holding {
  id: string;
  ticker: string;
  companyName: string;
  assetType: string;
  quantity: number;
  costBasis: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  thesis: string | null;
  exitCriteria: string | null;
  status: string;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [allocation, setAllocation] = useState<AllocationEntry[]>([]);
  const [suggestions, setSuggestions] = useState<RebalancingSuggestion[]>([]);
  const [alerts, setAlerts] = useState<PortfolioAlertData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio/alerts?status=UNREAD");
      if (res.ok) {
        setAlerts(await res.json());
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [holdingsRes, allocationRes] = await Promise.all([
        fetch("/api/portfolio/holdings"),
        fetch("/api/portfolio/allocation"),
      ]);

      if (holdingsRes.ok) {
        setHoldings(await holdingsRes.json());
      }
      if (allocationRes.ok) {
        const data = await allocationRes.json();
        setAllocation(data.allocation);
        setTotalValue(data.totalValue);
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAlerts();
  }, [fetchData, fetchAlerts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent =
    totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground">Portfolio</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your holdings and track allocation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScanButton onComplete={fetchAlerts} />
          <AddHoldingForm onSuccess={fetchData} />
        </div>
      </div>

      {/* Portfolio alerts */}
      <PortfolioAlerts alerts={alerts} onDismiss={fetchAlerts} />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalGainLoss)}{" "}
              <span className="text-sm">
                ({totalGainLossPercent >= 0 ? "+" : ""}
                {totalGainLossPercent.toFixed(1)}%)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Macro recommendations */}
      <MacroRecommendations />

      {/* Rebalancing alerts */}
      <RebalanceAlert suggestions={suggestions} />

      {/* Allocation chart */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <AllocationChart allocation={allocation} totalValue={totalValue} />
        </CardContent>
      </Card>

      {/* Holdings table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <HoldingsTable holdings={holdings} onRefresh={fetchData} />
        </CardContent>
      </Card>
    </div>
  );
}
