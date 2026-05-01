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
    color: "text-[var(--deepal-cyan)]",
    bg: "bg-[var(--deepal-cyan-dim)]",
    href: "/charges",
  },
  fuel: {
    icon: Fuel,
    color: "text-[var(--fuel-amber)]",
    bg: "bg-[var(--fuel-amber-dim)]",
    href: "/fuel",
  },
  service: {
    icon: Wrench,
    color: "text-[var(--service-purple)]",
    bg: "bg-[var(--service-purple-dim)]",
    href: "/maintenance",
  },
};

export function ActivityList({ activities, maxItems = 5, showViewAll }: Props) {
  const items = activities.slice(0, maxItems);

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Actividad Reciente
          </h2>
          {activities.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--card-border)] text-[var(--text-tertiary)]">
              {activities.length}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[var(--card-border)] flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Sin actividad aún
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Registra tu primera carga o combustible
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((activity, i) => {
            const cfg = config[activity.type];
            const Icon = cfg.icon;
            return (
              <Link
                key={activity.id}
                href={cfg.href}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--card-border)]/50 active:bg-[var(--card-border)] transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {activity.location}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-primary)] ml-2 shrink-0">
                      {activity.cost > 0 ? formatCurrency(activity.cost) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatDate(activity.date)}
                    </span>
                    <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--card-border)] text-[var(--text-tertiary)]">
                      {activity.detail}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {showViewAll && activities.length > maxItems && (
        <Link
          href="/charges"
          className="flex items-center justify-center gap-1 mt-2 py-2 text-xs font-medium text-[var(--deepal-cyan)] rounded-xl hover:bg-[var(--deepal-cyan-dim)] transition-colors"
        >
          Ver toda la actividad
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
