"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalysisForm() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start analysis");
      }

      const analysis = await res.json();
      router.push(`/analyze/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g., COST)"
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !ticker.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze"
        )}
      </Button>
      {error && (
        <span className="self-center text-sm text-red-600">{error}</span>
      )}
    </form>
  );
}
