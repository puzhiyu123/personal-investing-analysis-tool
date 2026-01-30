"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { ACTION_COLORS } from "@/types/decisions";
import type { BadgeProps } from "@/components/ui/badge";

interface Decision {
  id: string;
  ticker: string;
  action: string;
  decisionDate: string;
  priceAtDecision: number | null;
  thesis: string | null;
  reasoning: string | null;
  outcome: string | null;
}

interface DecisionListProps {
  decisions: Decision[];
  filterAction: string | null;
  filterTicker: string;
  onRefresh: () => void;
}

export function DecisionList({
  decisions,
  filterAction,
  filterTicker,
  onRefresh,
}: DecisionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = decisions.filter((d) => {
    if (filterAction && d.action !== filterAction) return false;
    if (
      filterTicker &&
      !d.ticker.toLowerCase().includes(filterTicker.toLowerCase())
    )
      return false;
    return true;
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/decisions/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No decisions found. Log your first investment decision.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((d) => (
        <div
          key={d.id}
          className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{d.ticker}</span>
              <Badge
                variant={
                  ACTION_COLORS[d.action] as BadgeProps["variant"] || "secondary"
                }
              >
                {d.action}
              </Badge>
              {d.outcome && d.outcome !== "PENDING" && (
                <Badge
                  variant={
                    d.outcome === "CORRECT" ? "success" : "error"
                  }
                  size="sm"
                >
                  {d.outcome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(d.decisionDate)}
              {d.priceAtDecision != null &&
                ` at ${formatCurrency(d.priceAtDecision)}`}
            </p>
            {d.thesis && (
              <p className="text-sm text-foreground/80">{d.thesis}</p>
            )}
            {d.reasoning && (
              <p className="text-xs text-muted-foreground">
                {d.reasoning}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 shrink-0"
            disabled={deletingId === d.id}
            onClick={() => handleDelete(d.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
