"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, HelpCircle } from "lucide-react";

interface CyclePosition {
  position: string;
  description: string;
  phase?: string;
}

interface RegimeAssessmentProps {
  shortTermDebtCycle: string | null;
  longTermDebtCycle: string | null;
  businessCycle: string | null;
  riskLevel: string | null;
}

function parseCycle(json: string | null): CyclePosition | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const SHORT_TERM_PHASES = [
  { key: "early_recovery", label: "Early Recovery", color: "bg-emerald-400" },
  { key: "early_expansion", label: "Early Expansion", color: "bg-green-400" },
  { key: "late_expansion", label: "Late Expansion", color: "bg-amber-400" },
  { key: "tightening", label: "Tightening", color: "bg-orange-400" },
  { key: "recession", label: "Recession", color: "bg-red-400" },
];

const LONG_TERM_PHASES = [
  { key: "early", label: "Early", color: "bg-emerald-400" },
  { key: "bubble", label: "Bubble", color: "bg-amber-400" },
  { key: "top", label: "Top", color: "bg-orange-400" },
  { key: "depression", label: "Depression", color: "bg-red-400" },
  { key: "deleveraging", label: "Deleveraging", color: "bg-rose-400" },
  { key: "normalization", label: "Normalization", color: "bg-teal-400" },
];

const BUSINESS_PHASES = [
  { key: "trough", label: "Trough", color: "bg-blue-400" },
  { key: "expansion", label: "Expansion", color: "bg-emerald-400" },
  { key: "peak", label: "Peak", color: "bg-amber-400" },
  { key: "contraction", label: "Contraction", color: "bg-red-400" },
];

const CYCLE_EXPLAINERS: Record<string, string> = {
  "Short-Term Debt Cycle":
    "Lasts 5-8 years. Driven by central bank interest rate policy. Credit expands during recovery/expansion, then contracts during tightening/recession. Understanding where we are helps time investments and risk exposure.",
  "Long-Term Debt Cycle":
    "Lasts 50-75 years. Tracks the overall level of debt in the economy relative to income. When debt grows faster than income for decades, it eventually becomes unsustainable, leading to a major deleveraging event.",
  "Business Cycle":
    "The natural rhythm of economic activity — GDP growth, corporate earnings, and employment. Expansion phases favor growth assets; contraction phases favor defensive positioning.",
};

function CycleVisual({
  phases,
  activePhase,
}: {
  phases: { key: string; label: string; color: string }[];
  activePhase: string | undefined;
}) {
  const activeIndex = phases.findIndex((p) => p.key === activePhase);

  return (
    <div className="mt-5 mb-2">
      {/* Phase bar */}
      <div className="flex rounded-xl overflow-hidden h-4 mb-3">
        {phases.map((phase, i) => (
          <div
            key={phase.key}
            className={`flex-1 relative ${
              i === activeIndex ? phase.color : "bg-muted"
            } ${i > 0 ? "ml-0.5" : ""}`}
          >
            {i === activeIndex && (
              <div
                className="absolute inset-0 animate-pulse opacity-50 rounded"
                style={{ backgroundColor: "white" }}
              />
            )}
          </div>
        ))}
      </div>
      {/* Phase labels + arrow */}
      <div className="flex">
        {phases.map((phase, i) => (
          <div
            key={phase.key}
            className={`flex-1 text-center ${i > 0 ? "ml-0.5" : ""}`}
          >
            {i === activeIndex && (
              <div className="text-foreground text-base mb-0.5">&#9650;</div>
            )}
            <span
              className={`text-xs leading-tight block ${
                i === activeIndex
                  ? "font-bold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegimeAssessment({
  shortTermDebtCycle,
  longTermDebtCycle,
  businessCycle,
}: RegimeAssessmentProps) {
  const shortTerm = parseCycle(shortTermDebtCycle);
  const longTerm = parseCycle(longTermDebtCycle);
  const business = parseCycle(businessCycle);

  const cycles = [
    {
      label: "Short-Term Debt Cycle",
      data: shortTerm,
      phases: SHORT_TERM_PHASES,
    },
    {
      label: "Long-Term Debt Cycle",
      data: longTerm,
      phases: LONG_TERM_PHASES,
    },
    { label: "Business Cycle", data: business, phases: BUSINESS_PHASES },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-5 w-5 text-primary-500" />
          Cycle Positioning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-10">
          {cycles.map(({ label, data, phases }) => (
            <CycleSection
              key={label}
              label={label}
              data={data}
              phases={phases}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CycleSection({
  label,
  data,
  phases,
}: {
  label: string;
  data: CyclePosition | null;
  phases: { key: string; label: string; color: string }[];
}) {
  const [showExplainer, setShowExplainer] = useState(false);
  const explainer = CYCLE_EXPLAINERS[label];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-semibold text-foreground">{label}</h4>
          {explainer && (
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="text-muted-foreground hover:text-primary-500 transition-colors"
              title="What does this mean?"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        {data?.phase && (
          <Badge variant="outline" size="lg">
            {data.phase.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      {showExplainer && explainer && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 bg-muted/50 rounded-lg p-3 border border-border">
          {explainer}
        </p>
      )}

      {data ? (
        <>
          <p className="text-lg text-foreground/85 leading-relaxed">
            {data.position}
          </p>
          <CycleVisual phases={phases} activePhase={data.phase} />
          <div className="mt-2 text-lg text-muted-foreground leading-relaxed">
            {data.description.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-base text-muted-foreground">No data</p>
      )}
    </div>
  );
}
