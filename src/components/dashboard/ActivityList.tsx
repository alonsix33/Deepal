"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Zap, Fuel, Wrench, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  type: "charge" | "fuel" | "service";
  date: string;
  location: string;
  cost: number;
  detail: string;
}

interface Props {
  activities: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
}

const config = {
  charge: {
    icon: Zap,
    color: "var(--md-primary)",
    bg: "var(--md-primary-container)",
    href: "/charges",
  },
  fuel: {
    icon: Fuel,
    color: "var(--color-fuel)",
    bg: "var(--color-fuel-container)",
    href: "/fuel",
  },
  service: {
    icon: Wrench,
    color: "var(--color-service)",
    bg: "var(--color-service-container)",
    href: "/maintenance",
  },
};

export function ActivityList({ activities, maxItems = 5, showViewAll }: Props) {
  const items = activities.slice(0, maxItems);

  return (
    <div className="card-filled p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2
            className="type-label-sm uppercase tracking-wider"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            Actividad Reciente
          </h2>
          {activities.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--md-surface-container-highest)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              {activities.length}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--md-surface-container-highest)" }}
          >
            <Zap className="w-5 h-5" style={{ color: "var(--md-on-surface-variant)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
            Sin actividad aún
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
            Registra tu primera carga o combustible
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((activity) => {
            const cfg = config[activity.type];
            const Icon = cfg.icon;
            return (
              <Link
                key={activity.id}
                href={cfg.href}
                className="flex items-center gap-3 px-2 py-2.5 rounded-[var(--shape-md)] transition-colors active:scale-[0.98]"
              >
                <div
                  className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--md-on-surface)" }}
                    >
                      {activity.location}
                    </span>
                    <span
                      className="text-xs font-semibold ml-2 shrink-0"
                      style={{ color: "var(--md-on-surface)" }}
                    >
                      {activity.cost > 0 ? formatCurrency(activity.cost) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                      {formatDate(activity.date)}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--md-surface-container-highest)",
                        color: "var(--md-on-surface-variant)",
                      }}
                    >
                      {activity.detail}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "var(--md-on-surface-variant)" }}
                />
              </Link>
            );
          })}
        </div>
      )}

      {showViewAll && activities.length > maxItems && (
        <Link
          href="/charges"
          className="flex items-center justify-center gap-1 mt-2 py-2 text-xs font-medium rounded-[var(--shape-md)] transition-colors"
          style={{ color: "var(--md-primary)" }}
        >
          Ver toda la actividad
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
