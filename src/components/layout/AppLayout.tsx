"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { registerServiceWorker } from "@/lib/serviceWorker";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen gradient-deepal">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={cn(
          "pt-16 pb-20 lg:pb-8 lg:pl-64",
          "min-h-screen"
        )}
      >
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
