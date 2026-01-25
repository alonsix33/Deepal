"use client";

import React from "react";
import { Zap, Fuel, Wrench, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ActivityType = "charge" | "fuel" | "service";

interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  location: string;
  cost: number;
  detail?: string;
}

interface ActivityListProps {
  activities: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
  className?: string;
}

const activityConfig = {
  charge: {
    icon: Zap,
    label: "Carga",
    color: "text-[var(--deepal-cyan)]",
    bg: "bg-[var(--deepal-cyan)]/10",
    href: "/charges",
  },
  fuel: {
    icon: Fuel,
    label: "Combustible",
    color: "text-[var(--deepal-warning)]",
    bg: "bg-[var(--deepal-warning)]/10",
    href: "/fuel",
  },
  service: {
    icon: Wrench,
    label: "Servicio",
    color: "text-[var(--deepal-blue)]",
    bg: "bg-[var(--deepal-blue)]/10",
    href: "/maintenance",
  },
};

export function ActivityList({
  activities,
  maxItems = 5,
  showViewAll = true,
  className,
}: ActivityListProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <GlassCard className={className}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Zap className="w-10 h-10 text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">
            No hay actividad reciente
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Registra tu primera carga para comenzar
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-0", className)}>
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="font-semibold">Actividad Reciente</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {displayedActivities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-4 hover:bg-[var(--secondary)]/50 transition-colors"
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activity.location}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {formatDate(activity.date)}
                  {activity.detail && ` - ${activity.detail}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(activity.cost)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {showViewAll && activities.length > maxItems && (
        <Link
          href="/analytics"
          className="flex items-center justify-center gap-2 p-3 text-sm text-[var(--primary)] hover:bg-[var(--secondary)]/50 transition-colors border-t border-[var(--border)]"
        >
          Ver toda la actividad
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </GlassCard>
  );
}
