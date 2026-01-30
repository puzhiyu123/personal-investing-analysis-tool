"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import type { PortfolioAlertData } from "@/types/portfolio";

interface PortfolioAlertsProps {
  alerts: PortfolioAlertData[];
  onDismiss: () => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertTriangle,
    borderColor: "border-red-300",
    bgColor: "bg-red-50/50",
    iconColor: "text-red-600",
    badgeVariant: "error" as const,
  },
  WARNING: {
    icon: AlertCircle,
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50/50",
    iconColor: "text-amber-600",
    badgeVariant: "warning" as const,
  },
  INFO: {
    icon: Info,
    borderColor: "border-blue-300",
    bgColor: "bg-blue-50/50",
    iconColor: "text-blue-600",
    badgeVariant: "default" as const,
  },
};

export function PortfolioAlerts({ alerts, onDismiss }: PortfolioAlertsProps) {
  const [dismissing, setDismissing] = useState<string | null>(null);

  if (alerts.length === 0) return null;

  async function handleDismiss(alertId: string) {
    setDismissing(alertId);
    try {
      const res = await fetch(`/api/portfolio/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISMISSED" }),
      });
      if (res.ok) onDismiss();
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    } finally {
      setDismissing(null);
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config =
          SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ??
          SEVERITY_CONFIG.INFO;
        const Icon = config.icon;

        return (
          <Card
            key={alert.id}
            className={`${config.borderColor} ${config.bgColor}`}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={config.badgeVariant} size="sm">
                      {alert.severity}
                    </Badge>
                    {alert.ticker && (
                      <Badge variant="outline" size="sm">
                        {alert.ticker}
                      </Badge>
                    )}
                    {alert.alertType === "WATCHLIST_ADD" && (
                      <Badge variant="success" size="sm">
                        Added to watchlist
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-base font-medium text-foreground">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-base text-foreground/80 leading-relaxed">
                    {alert.description}
                  </p>
                  {alert.actionSuggested && (
                    <p className="mt-2 text-sm font-medium text-muted-foreground rounded-lg bg-muted/50 px-3 py-1.5">
                      Suggested: {alert.actionSuggested}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  disabled={dismissing === alert.id}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  aria-label="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
