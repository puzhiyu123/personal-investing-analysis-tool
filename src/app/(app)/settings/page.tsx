"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Save, Loader2 } from "lucide-react";

interface Targets {
  liquid: number;
  equities: number;
  crypto: number;
  bonds: number;
  other: number;
  [key: string]: number;
}

const TARGET_LABELS: Record<string, string> = {
  liquid: "Liquid / Cash",
  equities: "Equities",
  crypto: "Crypto",
  bonds: "Bonds",
  other: "Other",
};

export default function SettingsPage() {
  const [targets, setTargets] = useState<Targets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setTargets(data.allocationTargets);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    if (!targets) return;
    setIsSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocationTargets: targets }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!targets) return null;

  const total = Object.values(targets).reduce((sum, v) => sum + v, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your allocation targets and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(TARGET_LABELS).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {targets[key]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={targets[key]}
                onChange={(e) =>
                  setTargets({
                    ...targets,
                    [key]: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-primary-500"
              />
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span
              className={`text-sm font-medium ${
                Math.abs(total - 100) > 0.1
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              Total: {total.toFixed(1)}%
              {Math.abs(total - 100) > 0.1 && " (should be 100%)"}
            </span>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                "Saved!"
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Targets
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
