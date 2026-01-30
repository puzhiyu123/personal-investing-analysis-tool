"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DecisionForm } from "@/components/features/decisions/decision-form";
import { DecisionList } from "@/components/features/decisions/decision-list";
import { DecisionPatternsCard } from "@/components/features/decisions/decision-patterns";
import type { DecisionPatterns } from "@/types/decisions";

const ACTIONS = ["ALL", "BUY", "SELL", "PASS", "WATCH", "TRIM", "ADD"];

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState([]);
  const [patterns, setPatterns] = useState<DecisionPatterns | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterTicker, setFilterTicker] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [decisionsRes, patternsRes] = await Promise.all([
        fetch("/api/decisions"),
        fetch("/api/decisions/patterns"),
      ]);

      if (decisionsRes.ok) setDecisions(await decisionsRes.json());
      if (patternsRes.ok) setPatterns(await patternsRes.json());
    } catch (error) {
      console.error("Error fetching decisions:", error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground">
            Decision Log
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your investment decisions and patterns
          </p>
        </div>
        <DecisionForm onSuccess={fetchData} />
      </div>

      {patterns && <DecisionPatternsCard patterns={patterns} />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Decisions</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by ticker..."
                value={filterTicker}
                onChange={(e) => setFilterTicker(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <div className="flex gap-1">
                {ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      setFilterAction(a === "ALL" ? null : a)
                    }
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      (a === "ALL" && !filterAction) ||
                      filterAction === a
                        ? "bg-primary-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DecisionList
            decisions={decisions}
            filterAction={filterAction}
            filterTicker={filterTicker}
            onRefresh={fetchData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
