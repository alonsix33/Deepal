"use client";

import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { formatCurrency, formatKm } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import {
  Zap,
  Fuel,
  Wrench,
  Plus,
  Gauge,
  ParkingCircle,
} from "lucide-react";
import Link from "next/link";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const { charges, fuelUps, services, getDashboardStats, settings } =
    useStore();
  const stats = getDashboardStats();

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

  const electricPct = stats.electricUsagePercent;
  const fuelPct = 100 - electricPct;

  return (
    <AppLayout>
      <motion.div
        className="space-y-4 pb-24"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Hero - Typographic Brand */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[var(--radius-md)] gradient-hero px-5 pt-8 pb-5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--deepal-cyan)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--deepal-blue)]/5 rounded-full blur-2xl" />

          <div className="relative">
            <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-2">
              Changan · Deepal
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-none">
              <span className="text-[var(--text-primary)]">Deepal</span>{" "}
              <span className="bg-gradient-to-r from-[var(--deepal-cyan)] to-[var(--deepal-blue)] bg-clip-text text-transparent">
                S05
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                REEV · 27.28 kWh
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatKm(stats.totalKmDriven)}
              </span>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--card-border)]">
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  Total invertido
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                  {formatCurrency(grandTotal)}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/charges/new">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--deepal-cyan)] text-[var(--black)] text-xs font-semibold active:scale-95 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                    Carga
                  </button>
                </Link>
                <Link href="/fuel/new">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--card-border)] text-xs font-medium text-[var(--text-primary)] active:scale-95 transition-transform">
                    <Fuel className="w-3.5 h-3.5" />
                    Gas
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Energy Mix */}
        <motion.div variants={fadeUp} className="card-premium p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Mix Energético
            </h2>
            <span className="text-[11px] text-[var(--text-tertiary)]">
              Total {formatCurrency(totalEnergyCost)}
            </span>
          </div>

          {/* Electric vs Fuel bar */}
          <div className="relative h-8 rounded-full overflow-hidden bg-[var(--card-border)] mb-3">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--deepal-cyan)] to-[var(--deepal-blue)]"
              initial={{ width: 0 }}
              animate={{ width: `${electricPct}%` }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-[var(--fuel-amber)] to-[var(--fuel-amber)]/80"
              initial={{ width: 0 }}
              animate={{ width: `${fuelPct}%` }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>

          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--deepal-cyan)]" />
              <span className="text-[var(--text-secondary)]">Eléctrico</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {Math.round(electricPct)}%
              </span>
              <span className="text-[var(--text-tertiary)]">
                {formatCurrency(stats.totalChargeCost)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--fuel-amber)]" />
              <span className="text-[var(--text-secondary)]">Combustible</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {Math.round(fuelPct)}%
              </span>
              <span className="text-[var(--text-tertiary)]">
                {formatCurrency(stats.totalFuelCost)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          <div className="card-premium p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--deepal-cyan-dim)] flex items-center justify-center">
                <Gauge className="w-4 h-4 text-[var(--deepal-cyan)]" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(stats.averageCostPerKm)}</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Costo por km · {formatKm(stats.totalKmDriven)} totales
            </div>
          </div>

          <div className="card-premium p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--fuel-amber-dim)] flex items-center justify-center">
                <Wrench className="w-4 h-4 text-[var(--fuel-amber)]" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{formatKm(stats.nextServiceKm)}</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Próximo servicio · km restantes
            </div>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div variants={fadeUp} className="card-premium p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Costos Acumulados
            </h2>
            <span className="text-sm font-bold">S/ {grandTotal.toFixed(2)}</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                label: "Electricidad",
                value: stats.totalChargeCost,
                icon: Zap,
                color: "text-[var(--deepal-cyan)]",
                bg: "bg-[var(--deepal-cyan-dim)]",
                bar: "bg-[var(--deepal-cyan)]",
              },
              {
                label: "Combustible",
                value: stats.totalFuelCost,
                icon: Fuel,
                color: "text-[var(--fuel-amber)]",
                bg: "bg-[var(--fuel-amber-dim)]",
                bar: "bg-[var(--fuel-amber)]",
              },
              {
                label: "Estacionamiento",
                value: totalParkingCost,
                icon: ParkingCircle,
                color: "text-[var(--parking-gold)]",
                bg: "bg-[var(--parking-gold-dim)]",
                bar: "bg-[var(--parking-gold)]",
              },
              {
                label: "Mantenimiento",
                value: stats.totalMaintenanceCost,
                icon: Wrench,
                color: "text-[var(--service-purple)]",
                bg: "bg-[var(--service-purple-dim)]",
                bar: "bg-[var(--service-purple)]",
              },
            ].map((item) => {
              const pct = grandTotal > 0 ? (item.value / grandTotal) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--card-border)] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div variants={fadeUp}>
          <ActivityList activities={recentActivities} maxItems={5} showViewAll />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
