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
  BatteryFull,
  Route,
  DollarSign,
  ParkingCircle,
  Gauge,
} from "lucide-react";
import Link from "next/link";

const CarModel = dynamic(
  () => import("@/components/3d/CarModel").then((mod) => mod.CarModel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[250px] lg:h-[350px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Car className="w-10 h-10 text-[var(--deepal-cyan)] animate-pulse" />
          <span className="text-sm text-[var(--muted-foreground)]">
            Cargando...
          </span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const { charges, fuelUps, services, getDashboardStats, currentBatteryLevel, settings } =
    useStore();
  const stats = getDashboardStats();

  const totalKm = stats.totalKmDriven;
  const totalParkingCost = charges.reduce((s, c) => s + c.parkingCostPEN, 0);
  const totalEnergyCost = stats.totalChargeCost + stats.totalFuelCost;
  const grandTotal = totalEnergyCost + stats.totalMaintenanceCost;

  const recentActivities = [
    ...charges.map((c) => ({
      id: c.id,
      type: "charge" as const,
      date: c.date,
      location: c.location,
      cost: c.totalCost,
      detail: `${c.kwhCharged} kWh`,
    })),
    ...fuelUps.map((f) => ({
      id: f.id,
      type: "fuel" as const,
      date: f.date,
      location: f.location || "Gasolinera",
      cost: f.costPEN,
      detail: `${f.gallons} gal`,
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
      <div className="space-y-4 pb-8">
        {/* Hero - 3D + Battery */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--deepal-cyan)]/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="h-[200px] lg:h-[280px]">
              <CarModel autoRotate showControls={false} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--black)]/90 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <BatteryIndicator
                    level={currentBatteryLevel}
                    range={stats.estimatedRange}
                  />
                </div>
                <div className="flex gap-2">
                  <Link href="/charges/new">
                    <Button variant="cyan" size="sm" className="gap-1.5 text-xs h-9">
                      <Plus className="w-3.5 h-3.5" />
                      Carga
                    </Button>
                  </Link>
                  <Link href="/fuel/new">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 border-[var(--deepal-cyan)]/30">
                      <Fuel className="w-3.5 h-3.5" />
                      Gas
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tarifa badge */}
        <div className="flex items-center justify-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span>Tarifa BT5B:</span>
          <span className="font-semibold text-[var(--deepal-cyan)]">S/ {settings.electricityRateKwh}/kWh</span>
          <span className="mx-1">·</span>
          <span>Batería {settings.batteryCapacity} kWh</span>
          <span className="mx-1">·</span>
          <span>Eficiencia {Math.round(settings.chargingEfficiency * 100)}%</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Costo Total"
            value={formatCurrency(grandTotal)}
            subtitle="Energía + Mantenimiento"
            icon={DollarSign}
            color="cyan"
          />
          <StatCard
            title="Costo/km"
            value={formatCurrency(stats.averageCostPerKm)}
            subtitle={`${formatKm(totalKm)} recorridos`}
            icon={Gauge}
            color="blue"
          />
          <StatCard
            title="Uso Eléctrico"
            value={`${Math.round(stats.electricUsagePercent)}%`}
            subtitle="vs combustible (por costo)"
            icon={BatteryFull}
            color="teal"
          />
          <StatCard
            title="Próximo Service"
            value={formatKm(stats.nextServiceKm)}
            subtitle="km restantes"
            icon={Wrench}
            color="warning"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <Zap className="w-4 h-4 text-[var(--deepal-cyan)] mx-auto mb-1" />
            <div className="text-lg font-bold">{formatCurrency(stats.totalChargeCost)}</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Electricidad</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <Fuel className="w-4 h-4 text-[var(--deepal-warning)] mx-auto mb-1" />
            <div className="text-lg font-bold">{formatCurrency(stats.totalFuelCost)}</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Combustible</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <ParkingCircle className="w-4 h-4 text-[var(--muted-foreground)] mx-auto mb-1" />
            <div className="text-lg font-bold">{formatCurrency(totalParkingCost)}</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Estacionamiento</div>
          </div>
        </div>

        {/* Activity + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ActivityList
              activities={recentActivities}
              maxItems={5}
              showViewAll
            />
          </div>

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-4 h-4 text-[var(--deepal-cyan)]" />
              <h3 className="font-semibold text-sm">Resumen</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Km recorridos", value: formatKm(totalKm) },
                { label: "Cargas", value: `${charges.length} cargas` },
                { label: "Combustible", value: `${fuelUps.length} cargas` },
                { label: "Servicios", value: `${services.length} servicios` },
                { label: "Costo energía", value: formatCurrency(totalEnergyCost) },
                { label: "Costo total", value: formatCurrency(grandTotal) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-0 text-sm"
                >
                  <span className="text-[var(--muted-foreground)]">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/vehicle" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <Car className="w-3.5 h-3.5" />
                Detalles del vehículo
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
