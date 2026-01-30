"use client";

import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  status: string;
}

const STEPS = [
  { label: "Gathering financial data...", key: "gather" },
  { label: "Analyzing competitive moat...", key: "moat" },
  { label: "Assessing AI disruption risk...", key: "ai" },
  { label: "Generating Buffett analysis...", key: "analyze" },
  { label: "Compiling report...", key: "compile" },
];

export function AnalysisProgress({ status }: AnalysisProgressProps) {
  if (status === "COMPLETE") return null;

  if (status === "FAILED") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-8 text-center">
          <p className="text-red-700 font-medium">Analysis failed</p>
          <p className="text-sm text-red-600 mt-1">
            Please try again. Check that your API keys are configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-center justify-center mb-6">
          <Spinner size="lg" />
        </div>
        <div className="space-y-3 max-w-sm mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              {i === 0 ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
              ) : (
                <Circle className="h-4 w-4 text-sand-300" />
              )}
              <span
                className={`text-sm ${
                  i === 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          This may take a minute. The page will auto-refresh when complete.
        </p>
      </CardContent>
    </Card>
  );
}

export function AnalysisComplete() {
  return (
    <div className="flex items-center gap-2 text-green-600 text-sm">
      <CheckCircle className="h-4 w-4" />
      Analysis complete
    </div>
  );
}
