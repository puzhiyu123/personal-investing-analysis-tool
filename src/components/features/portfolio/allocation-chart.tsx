"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { AllocationEntry } from "@/types/portfolio";

interface AllocationChartProps {
  allocation: AllocationEntry[];
  totalValue: number;
}

const COLORS = [
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f97316", // orange
];

export function AllocationChart({ allocation, totalValue }: AllocationChartProps) {
  if (totalValue === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Add holdings to see your allocation breakdown.</p>
      </div>
    );
  }

  const actualData = allocation
    .filter((a) => a.currentPercent > 0)
    .map((a, i) => ({
      name: a.label,
      value: a.currentPercent,
      fill: COLORS[i % COLORS.length],
    }));

  const targetData = allocation
    .filter((a) => a.targetPercent > 0)
    .map((a, i) => ({
      name: a.label,
      value: a.targetPercent,
      fill: COLORS[i % COLORS.length],
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
          Actual Allocation
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={actualData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
            >
              {actualData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
          Target Allocation
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={targetData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
            >
              {targetData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
