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

interface AddHoldingFormProps {
  onSuccess: () => void;
}

const ASSET_TYPES = [
  { value: "EQUITY", label: "Equity" },
  { value: "ETF", label: "ETF" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "BOND", label: "Bond" },
  { value: "CASH", label: "Cash / Liquid" },
  { value: "OTHER", label: "Other" },
];

export function AddHoldingForm({ onSuccess }: AddHoldingFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [assetType, setAssetType] = useState("EQUITY");
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [thesis, setThesis] = useState("");
  const [exitCriteria, setExitCriteria] = useState("");

  function resetForm() {
    setTicker("");
    setCompanyName("");
    setAssetType("EQUITY");
    setQuantity("");
    setCostBasis("");
    setCurrentPrice("");
    setThesis("");
    setExitCriteria("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/portfolio/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          companyName,
          assetType,
          quantity: parseFloat(quantity),
          costBasis: parseFloat(costBasis),
          currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
          thesis: thesis || undefined,
          exitCriteria: exitCriteria || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create holding");
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
          Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Holding</DialogTitle>
          <DialogDescription>
            Add a new position to your portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Ticker</label>
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="AAPL"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Apple Inc."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Asset Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cost Basis</label>
              <Input
                type="number"
                step="any"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Price</label>
              <Input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="175.00"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Investment Thesis</label>
            <Textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Why are you buying this?"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exit Criteria</label>
            <Textarea
              value={exitCriteria}
              onChange={(e) => setExitCriteria(e.target.value)}
              placeholder="When would you sell?"
              className="min-h-[80px]"
            />
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
              "Add Holding"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
