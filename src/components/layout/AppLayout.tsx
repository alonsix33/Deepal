"use client";

import React, { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { registerServiceWorker } from "@/lib/serviceWorker";

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav }: AppLayoutProps) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--black)]">
      <main className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-24 safe-top">
          {children}
        </div>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
