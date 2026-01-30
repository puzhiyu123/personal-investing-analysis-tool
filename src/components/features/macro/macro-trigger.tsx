"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MacroTrigger() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScan() {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/macro", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start scan");
      }

      const report = await res.json();
      router.push(`/macro/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleScan} disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Scan...
          </>
        ) : (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Run Macro Scan
          </>
        )}
      </Button>
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}
