"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { ASSET_TYPE_LABELS } from "@/types/portfolio";

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

interface HoldingsTableProps {
  holdings: Holding[];
  onRefresh: () => void;
}

type SortField = "ticker" | "currentValue" | "gainLoss" | "assetType";
type SortDir = "asc" | "desc";

export function HoldingsTable({ holdings, onRefresh }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sorted = [...holdings].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "ticker":
        cmp = a.ticker.localeCompare(b.ticker);
        break;
      case "currentValue":
        cmp = a.currentValue - b.currentValue;
        break;
      case "gainLoss":
        cmp =
          a.currentValue - a.totalCost - (b.currentValue - b.totalCost);
        break;
      case "assetType":
        cmp = a.assetType.localeCompare(b.assetType);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/portfolio/holdings/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No holdings yet. Add your first position to get started.</p>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-200 text-left text-muted-foreground">
            <th
              className="cursor-pointer pb-3 pr-4 font-medium"
              onClick={() => toggleSort("ticker")}
            >
              <span className="inline-flex items-center gap-1">
                Ticker <SortIcon field="ticker" />
              </span>
            </th>
            <th
              className="cursor-pointer pb-3 pr-4 font-medium"
              onClick={() => toggleSort("assetType")}
            >
              <span className="inline-flex items-center gap-1">
                Type <SortIcon field="assetType" />
              </span>
            </th>
            <th className="pb-3 pr-4 font-medium text-right">Qty</th>
            <th className="pb-3 pr-4 font-medium text-right">Cost Basis</th>
            <th className="pb-3 pr-4 font-medium text-right">Price</th>
            <th
              className="cursor-pointer pb-3 pr-4 font-medium text-right"
              onClick={() => toggleSort("currentValue")}
            >
              <span className="inline-flex items-center justify-end gap-1">
                Value <SortIcon field="currentValue" />
              </span>
            </th>
            <th
              className="cursor-pointer pb-3 pr-4 font-medium text-right"
              onClick={() => toggleSort("gainLoss")}
            >
              <span className="inline-flex items-center justify-end gap-1">
                Gain/Loss <SortIcon field="gainLoss" />
              </span>
            </th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => {
            const gainLoss = h.currentValue - h.totalCost;
            const gainLossPercent =
              h.totalCost > 0 ? (gainLoss / h.totalCost) * 100 : 0;
            const isExpanded = expandedId === h.id;

            return (
              <tr
                key={h.id}
                className="border-b border-sand-100 hover:bg-sand-50 transition-colors"
              >
                <td className="py-3 pr-4">
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : h.id)
                    }
                    className="text-left"
                  >
                    <span className="font-semibold">{h.ticker}</span>
                    {h.companyName && (
                      <span className="block text-xs text-muted-foreground">
                        {h.companyName}
                      </span>
                    )}
                  </button>
                  {isExpanded && (h.thesis || h.exitCriteria) && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {h.thesis && (
                        <p>
                          <span className="font-medium text-foreground">
                            Thesis:
                          </span>{" "}
                          {h.thesis}
                        </p>
                      )}
                      {h.exitCriteria && (
                        <p>
                          <span className="font-medium text-foreground">
                            Exit:
                          </span>{" "}
                          {h.exitCriteria}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" size="sm">
                    {ASSET_TYPE_LABELS[h.assetType] || h.assetType}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {h.quantity}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatCurrency(h.costBasis)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatCurrency(h.currentPrice)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums font-medium">
                  {formatCurrency(h.currentValue)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  <span
                    className={
                      gainLoss >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatCurrency(gainLoss)}
                    <span className="block text-xs">
                      {formatPercent(gainLossPercent)}
                    </span>
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : h.id)
                      }
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      disabled={deletingId === h.id}
                      onClick={() => handleDelete(h.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
