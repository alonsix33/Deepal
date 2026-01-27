"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/": "DEEPAL S05",
      "/charges": "Cargas",
      "/fuel": "Combustible",
      "/maintenance": "Mantenimiento",
      "/analytics": "Estadísticas",
      "/vehicle": "Vehículo",
      "/settings": "Configuración",
    };
    return titles[pathname] || "DEEPAL S05";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Car className="h-5 w-5 text-[var(--primary-foreground)]" />
          </div>
          <span
            className={cn(
              "font-bold text-lg tracking-wider text-glow-cyan transition-opacity",
              pathname !== "/" && "hidden sm:inline"
            )}
          >
            {getPageTitle()}
          </span>
        </Link>

        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
