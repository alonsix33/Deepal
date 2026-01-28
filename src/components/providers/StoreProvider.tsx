"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initializeFromAPI = useStore((state) => state.initializeFromAPI);
  const isInitialized = useStore((state) => state.isInitialized);

  useEffect(() => {
    // Initialize data from API on mount
    if (!isInitialized) {
      initializeFromAPI();
    }
  }, [initializeFromAPI, isInitialized]);

  return <>{children}</>;
}
