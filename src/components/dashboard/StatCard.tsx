"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "cyan" | "blue" | "teal" | "warning";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "cyan",
  className,
}: StatCardProps) {
  const colorClasses = {
    cyan: "text-[var(--deepal-cyan)]",
    blue: "text-[var(--deepal-blue)]",
    teal: "text-[var(--deepal-teal)]",
    warning: "text-[var(--deepal-warning)]",
  };

  const bgClasses = {
    cyan: "bg-[var(--deepal-cyan)]/10",
    blue: "bg-[var(--deepal-blue)]/10",
    teal: "bg-[var(--deepal-teal)]/10",
    warning: "bg-[var(--deepal-warning)]/10",
  };

  return (
    <GlassCard className={cn("hover:border-[var(--primary)]/30", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs",
                trend.isPositive
                  ? "text-[var(--deepal-teal)]"
                  : "text-[var(--destructive)]"
              )}
            >
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              <span className="text-[var(--muted-foreground)]">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", bgClasses[color])}>
          <Icon className={cn("w-5 h-5", colorClasses[color])} />
        </div>
      </div>
    </GlassCard>
  );
}
