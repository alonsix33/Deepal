"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Zap, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/": "Deepal S05",
  "/charges": "Cargas",
  "/fuel": "Combustible",
  "/maintenance": "Mantenimiento",
  "/analytics": "Estadísticas",
  "/vehicle": "Vehículo",
  "/settings": "Configuración",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Deepal S05";
  const isHome = pathname === "/";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 safe-top"
      style={{
        background: "var(--md-surface-container)",
        borderBottom: "1px solid var(--md-outline-variant)",
      }}
    >
      <div className="flex items-center h-14 px-2 max-w-lg mx-auto gap-1">
        {/* Brand mark */}
        <Link href="/" className="flex items-center gap-2 px-2 mr-auto">
          <div
            className="w-8 h-8 rounded-[var(--shape-sm)] flex items-center justify-center"
            style={{ background: "var(--md-primary)", color: "var(--md-on-primary)" }}
          >
            <Zap className="w-4 h-4" />
          </div>
          {!isHome && (
            <span
              className="font-semibold text-base"
              style={{ color: "var(--md-on-surface)" }}
            >
              {title}
            </span>
          )}
        </Link>

        <Button variant="ghost" size="icon" asChild>
          <Link href="/vehicle" aria-label="Mi Vehículo">
            <Car className="h-5 w-5" style={{ color: "var(--md-on-surface-variant)" }} />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings" aria-label="Configuración">
            <Settings className="h-5 w-5" style={{ color: "var(--md-on-surface-variant)" }} />
          </Link>
        </Button>
      </div>
    </header>
  );
}
