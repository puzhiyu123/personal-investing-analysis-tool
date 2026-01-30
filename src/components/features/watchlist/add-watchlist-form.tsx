"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

interface AddWatchlistFormProps {
  onSuccess: () => void;
}

export function AddWatchlistForm({ onSuccess }: AddWatchlistFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reason, setReason] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [targetCondition, setTargetCondition] = useState("");

  function resetForm() {
    setTicker("");
    setCompanyName("");
    setReason("");
    setTargetPrice("");
    setTargetCondition("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          companyName: companyName || undefined,
          reason: reason || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          targetCondition: targetCondition || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to watchlist");
      }

      resetForm();
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Watchlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
          <DialogDescription>
            Track a company you want to monitor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Ticker</label>
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="COST"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Costco"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Why are you watching?</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Strong moat, waiting for better entry price..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Target Price</label>
              <Input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="800.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Target Condition</label>
              <Input
                value={targetCondition}
                onChange={(e) => setTargetCondition(e.target.value)}
                placeholder="P/E under 35"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Watchlist"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
