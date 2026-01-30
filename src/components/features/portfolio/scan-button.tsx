"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Radar, Loader2 } from "lucide-react";

interface ScanButtonProps {
  onComplete: () => void;
}

export function ScanButton({ onComplete }: ScanButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollScan = useCallback(
    (scanId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/portfolio/scan/${scanId}`);
          if (!res.ok) return;
          const scan = await res.json();

          if (scan.status === "COMPLETE") {
            stopPolling();
            setIsScanning(false);
            onComplete();
          } else if (scan.status === "FAILED") {
            stopPolling();
            setIsScanning(false);
            setError("Scan failed. Please try again.");
          }
        } catch {
          stopPolling();
          setIsScanning(false);
          setError("Connection error while polling.");
        }
      }, 3000);
    },
    [onComplete, stopPolling]
  );

  async function handleScan() {
    setError(null);
    setIsScanning(true);

    try {
      const res = await fetch("/api/portfolio/scan", { method: "POST" });

      if (res.status === 409) {
        // Scan already in progress — poll for it
        const data = await res.json();
        pollScan(data.scanId);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start scan");
        setIsScanning(false);
        return;
      }

      const scan = await res.json();
      pollScan(scan.id);
    } catch {
      setError("Failed to start scan");
      setIsScanning(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleScan} disabled={isScanning} variant="outline">
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Radar className="mr-2 h-4 w-4" />
            Scan Portfolio
          </>
        )}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
