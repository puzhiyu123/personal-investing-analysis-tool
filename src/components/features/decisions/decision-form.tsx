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

interface DecisionFormProps {
  onSuccess: () => void;
}

const ACTIONS = ["BUY", "SELL", "PASS", "WATCH", "TRIM", "ADD"];

export function DecisionForm({ onSuccess }: DecisionFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState("BUY");
  const [priceAtDecision, setPriceAtDecision] = useState("");
  const [thesis, setThesis] = useState("");
  const [reasoning, setReasoning] = useState("");

  function resetForm() {
    setTicker("");
    setAction("BUY");
    setPriceAtDecision("");
    setThesis("");
    setReasoning("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          action,
          priceAtDecision: priceAtDecision
            ? parseFloat(priceAtDecision)
            : undefined,
          thesis: thesis || undefined,
          reasoning: reasoning || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log decision");
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
          Log Decision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Investment Decision</DialogTitle>
          <DialogDescription>
            Record your investment decision and reasoning
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
              <label className="text-sm font-medium">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Price at Decision</label>
            <Input
              type="number"
              step="any"
              value={priceAtDecision}
              onChange={(e) => setPriceAtDecision(e.target.value)}
              placeholder="850.00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Thesis</label>
            <Textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="What's your investment thesis?"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Reasoning</label>
            <Textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Detailed reasoning for this decision..."
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
                Logging...
              </>
            ) : (
              "Log Decision"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
