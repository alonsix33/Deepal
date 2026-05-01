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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-bottom">
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--black)]/90 backdrop-blur-2xl border-t border-[var(--card-border)]" />
        <div className="relative flex items-center justify-around px-2 pt-1 pb-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[60px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--deepal-cyan)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-[var(--deepal-cyan)]"
                      : "text-[var(--text-tertiary)]"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
