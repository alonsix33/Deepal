"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { BatteryIndicator } from "@/components/dashboard/BatteryIndicator";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatKm } from "@/lib/utils";
import {
  Zap,
  Fuel,
  Wrench,
  TrendingUp,
  Plus,
  Car,
} from "lucide-react";
import Link from "next/link";

const CarModel = dynamic(
  () => import("@/components/3d/CarModel").then((mod) => mod.CarModel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Car className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-sm text-[var(--muted-foreground)]">
            Cargando modelo 3D...
          </span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const { charges, fuelUps, services, getDashboardStats, currentBatteryLevel } =
    useStore();
  const stats = getDashboardStats();

  const recentActivities = [
    ...charges.map((c) => ({
      id: c.id,
      type: "charge" as const,
      date: c.date,
      location: c.location,
      cost: c.costPEN,
      detail: `${c.kwhCharged} kWh`,
    })),
    ...fuelUps.map((f) => ({
      id: f.id,
      type: "fuel" as const,
      date: f.date,
      location: f.location || "Gasolinera",
      cost: f.costPEN,
      detail: `${f.liters} L`,
    })),
    ...services.map((s) => ({
      id: s.id,
      type: "service" as const,
      date: s.date,
      location: s.provider || "Servicio",
      cost: s.costPEN,
      detail: s.serviceType,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero Section with 3D Model */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--deepal-cyan)]/5 to-transparent" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* 3D Model */}
            <div className="h-[300px] lg:h-[350px]">
              <CarModel autoRotate showControls />
            </div>

            {/* Battery & Range */}
            <div className="flex flex-col items-center lg:items-start gap-6 pb-4 lg:pb-0">
              <BatteryIndicator
                level={currentBatteryLevel}
                range={stats.estimatedRange}
              />

              <div className="flex gap-3">
                <Link href="/charges/new">
                  <Button variant="cyan" size="lg" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Registrar Carga
                  </Button>
                </Link>
                <Link href="/fuel/new">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Fuel className="w-4 h-4" />
                    Combustible
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Este Mes"
            value={formatCurrency(stats.totalChargeCost + stats.totalFuelCost)}
            subtitle="Costo total energía"
            icon={Zap}
            color="cyan"
          />
          <StatCard
            title="Costo/km"
            value={formatCurrency(stats.averageCostPerKm)}
            subtitle="Promedio"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Uso Eléctrico"
            value={`${Math.round(stats.electricUsagePercent)}%`}
            subtitle="vs combustible"
            icon={Fuel}
            color="teal"
          />
          <StatCard
            title="Prox. Servicio"
            value={formatKm(stats.nextServiceKm)}
            subtitle="restantes"
            icon={Wrench}
            color="warning"
          />
        </div>

        {/* Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityList
              activities={recentActivities}
              maxItems={5}
              showViewAll
            />
          </div>

          {/* Vehicle Summary */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Resumen del Vehículo</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">
                  Km recorridos
                </span>
                <span className="font-medium">
                  {formatKm(stats.totalKmDriven)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">
                  Cargas totales
                </span>
                <span className="font-medium">{charges.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">
                  Costo total cargas
                </span>
                <span className="font-medium">
                  {formatCurrency(stats.totalChargeCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">
                  Costo total combustible
                </span>
                <span className="font-medium">
                  {formatCurrency(stats.totalFuelCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--muted-foreground)]">
                  Costo mantenimiento
                </span>
                <span className="font-medium">
                  {formatCurrency(stats.totalMaintenanceCost)}
                </span>
              </div>
            </div>

            <Link href="/vehicle" className="block mt-4">
              <Button variant="outline" className="w-full gap-2">
                <Car className="w-4 h-4" />
                Ver detalles del vehículo
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
