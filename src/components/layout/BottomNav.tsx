"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  Fuel,
  Wrench,
  ChartNoAxesCombined,
} from "lucide-react";

const tabs = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/charges", icon: Zap, label: "Cargas" },
  { href: "/fuel", icon: Fuel, label: "Gasolina" },
  { href: "/maintenance", icon: Wrench, label: "Servicio" },
  { href: "/analytics", icon: ChartNoAxesCombined, label: "Stats" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "var(--md-surface-container)",
        borderTop: "1px solid var(--md-outline-variant)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[60px]"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active pill — wraps both icon and label */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 rounded-full"
                  style={{ background: "var(--md-secondary-container)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <span className="relative z-10">
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: isActive
                      ? "var(--md-on-secondary-container)"
                      : "var(--md-on-surface-variant)",
                  }}
                />
              </span>

              <span
                className="relative z-10 transition-colors"
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? "var(--md-on-secondary-container)"
                    : "var(--md-on-surface-variant)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
