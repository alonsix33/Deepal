"use client";

import React from "react";
import { Battery, BatteryCharging, Zap } from "lucide-react";
import { CircularProgress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BatteryIndicatorProps {
  level: number;
  range: number;
  isCharging?: boolean;
  className?: string;
}

export function BatteryIndicator({
  level,
  range,
  isCharging = false,
  className,
}: BatteryIndicatorProps) {
  const getColor = () => {
    if (level > 60) return "var(--deepal-cyan)";
    if (level > 30) return "var(--deepal-warning)";
    return "var(--destructive)";
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <CircularProgress
        value={level}
        size={160}
        strokeWidth={10}
        color={getColor()}
        showValue={false}
      >
        <div className="flex flex-col items-center">
          {isCharging ? (
            <BatteryCharging className="w-6 h-6 text-[var(--deepal-cyan)] animate-pulse" />
          ) : (
            <Battery className="w-6 h-6 text-[var(--muted-foreground)]" />
          )}
          <span className="text-3xl font-bold mt-1">{level}%</span>
          <span className="text-sm text-[var(--muted-foreground)]">
            Bateria
          </span>
        </div>
      </CircularProgress>

      <div className="flex items-center gap-2 text-center">
        <Zap className="w-4 h-4 text-[var(--deepal-cyan)]" />
        <span className="text-lg">
          <span className="font-bold">{range}</span>
          <span className="text-[var(--muted-foreground)] ml-1">km</span>
        </span>
        <span className="text-sm text-[var(--muted-foreground)]">
          autonomia
        </span>
      </div>
    </div>
  );
}
