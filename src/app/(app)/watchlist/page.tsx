"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { WatchlistTable } from "@/components/features/watchlist/watchlist-table";
import { AddWatchlistForm } from "@/components/features/watchlist/add-watchlist-form";
import { ScanWatchlistButton } from "@/components/features/watchlist/scan-watchlist-button";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Error fetching watchlist:", error);
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
          <h1 className="font-display text-4xl text-foreground">Watchlist</h1>
          <p className="mt-1 text-muted-foreground">
            Companies you&apos;re monitoring for potential investment
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScanWatchlistButton onComplete={fetchData} />
          <AddWatchlistForm onSuccess={fetchData} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watched Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <WatchlistTable items={items} onRefresh={fetchData} />
        </CardContent>
      </Card>
    </div>
  );
}
