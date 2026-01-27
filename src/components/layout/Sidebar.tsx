"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Fuel,
  Wrench,
  BarChart3,
  Car,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/charges", icon: Zap, label: "Cargas" },
  { href: "/fuel", icon: Fuel, label: "Combustible" },
  { href: "/maintenance", icon: Wrench, label: "Mantenimiento" },
  { href: "/analytics", icon: BarChart3, label: "Estadísticas" },
  { href: "/vehicle", icon: Car, label: "Vehículo" },
  { href: "/settings", icon: Settings, label: "Configuración" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <Car className="h-5 w-5 text-[var(--primary-foreground)]" />
              </div>
              <span className="font-bold text-lg tracking-wider">DEEPAL</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--muted-foreground)]">
              <p>Deepal S05 REEV Tracker</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
