"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SimplifiedReportProps {
  content: string;
}

export function SimplifiedReport({ content }: SimplifiedReportProps) {
  const blocks = content.split("\n\n");

  return (
    <Card>
      <CardContent className="py-10">
        <div className="max-w-prose mx-auto space-y-6">
          {blocks.map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // Detect ## headings
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="font-display text-2xl text-foreground pt-4 first:pt-0"
                >
                  {trimmed.slice(3)}
                </h2>
              );
            }

            return (
              <p key={i} className="text-lg text-foreground/85 leading-8">
                {trimmed}
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
