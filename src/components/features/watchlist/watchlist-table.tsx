"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface WatchlistItem {
  id: string;
  ticker: string;
  companyName: string;
  reason: string | null;
  targetPrice: number | null;
  targetCondition: string | null;
  status: string;
  createdAt: string;
}

interface WatchlistTableProps {
  items: WatchlistItem[];
  onRefresh: () => void;
}

export function WatchlistTable({ items, onRefresh }: WatchlistTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Your watchlist is empty. Add companies you want to monitor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-200 text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Ticker</th>
            <th className="pb-3 pr-4 font-medium">Reason</th>
            <th className="pb-3 pr-4 font-medium">Target</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Added</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-sand-100 hover:bg-sand-50 transition-colors"
            >
              <td className="py-3 pr-4">
                <span className="font-semibold">{item.ticker}</span>
                {item.companyName && (
                  <span className="block text-xs text-muted-foreground">
                    {item.companyName}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 max-w-xs">
                <span className="text-sm text-sand-700 line-clamp-2">
                  {item.reason || "-"}
                </span>
              </td>
              <td className="py-3 pr-4 tabular-nums">
                {item.targetPrice != null && (
                  <span>{formatCurrency(item.targetPrice)}</span>
                )}
                {item.targetCondition && (
                  <span className="block text-xs text-muted-foreground">
                    {item.targetCondition}
                  </span>
                )}
                {!item.targetPrice && !item.targetCondition && "-"}
              </td>
              <td className="py-3 pr-4">
                <Badge
                  variant={
                    item.status === "TRIGGERED"
                      ? "success"
                      : item.status === "REMOVED"
                        ? "secondary"
                        : "default"
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </td>
              <td className="py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
