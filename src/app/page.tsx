"use client";

import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { formatCurrency, formatKm, formatKwh } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import {
  Zap,
  Fuel,
  Wrench,
  Plus,
  Gauge,
  ParkingCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
};

export default function HomePage() {
  const { charges, fuelUps, services, getDashboardStats, settings } =
    useStore();
  const stats = getDashboardStats();

  const totalParkingCost = charges.reduce((s, c) => s + c.parkingCostPEN, 0);
  const totalEnergyCost = stats.totalChargeCost + stats.totalFuelCost;
  const grandTotal =
    totalEnergyCost + stats.totalMaintenanceCost + totalParkingCost;

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
  const totalKwh = charges.reduce((s, c) => s + c.kwhCharged, 0);

  return (
    <AppLayout>
      <motion.div
        className="space-y-4 pb-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Hero ── */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-[var(--shape-xl)] gradient-hero px-6 pt-8 pb-6"
          style={{ boxShadow: "0 2px 12px var(--md-shadow)" }}
        >
          {/* Decorative accent circles */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: "var(--md-primary)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: "var(--md-tertiary)" }}
          />

          <div className="relative">
            {/* Brand name */}
            <div className="mt-1 leading-none">
              <h1
                style={{
                  fontFamily: "'NOS', 'Space Grotesk', system-ui, sans-serif",
                  letterSpacing: "0.04em",
                  fontSize: "clamp(52px, 14vw, 72px)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                <span style={{ color: "var(--md-on-primary-container)" }}>DEEPAL </span>
                <span style={{ color: "var(--md-primary)" }}>S05</span>
              </h1>
            </div>

            {/* Tagline */}
            <p
              className="mt-2 type-label-sm tracking-[0.18em]"
              style={{ color: "var(--md-on-primary-container)" }}
            >
              RANGE EXTENDER EV · 27.28 kWh
            </p>

            {/* Stats strip */}
            <div
              className="flex items-center gap-3 mt-3 text-xs"
              style={{ color: "var(--md-on-primary-container)", opacity: 0.75 }}
            >
              <span>{formatKm(stats.totalKmDriven)} recorridos</span>
              <span
                className="w-px h-3"
                style={{ background: "currentColor", opacity: 0.4 }}
              />
              <span>{charges.length} cargas · {fuelUps.length} recargas</span>
            </div>

            {/* Divider + CTA row */}
            <div
              className="flex items-center justify-between mt-5 pt-4"
              style={{ borderTop: "1px solid color-mix(in srgb, var(--md-on-primary-container) 20%, transparent)" }}
            >
              <div>
                <p
                  className="type-label-sm"
                  style={{ color: "var(--md-on-primary-container)", opacity: 0.65 }}
                >
                  Total invertido
                </p>
                <p
                  className="text-2xl font-bold mt-0.5"
                  style={{
                    color: "var(--md-on-primary-container)",
                    fontFamily: "var(--font-display, 'Space Grotesk', system-ui, sans-serif)",
                  }}
                >
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href="/charges/new">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: "var(--md-primary)",
                      color: "var(--md-on-primary)",
                      boxShadow: "0 1px 3px var(--md-shadow)",
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Carga
                  </button>
                </Link>
                <Link href="/fuel/new">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                    style={{
                      background: "color-mix(in srgb, var(--md-on-primary-container) 12%, transparent)",
                      color: "var(--md-on-primary-container)",
                      border: "1px solid color-mix(in srgb, var(--md-on-primary-container) 25%, transparent)",
                    }}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    Gas
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Energy Mix ── */}
        <motion.div
          variants={fadeUp}
          className="card-filled p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="type-label-sm"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Mix Energético
            </h2>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              {formatCurrency(totalEnergyCost)} total
            </span>
          </div>

          {/* Bar */}
          <div
            className="relative h-7 rounded-full overflow-hidden mb-3"
            style={{ background: "var(--md-surface-container-highest)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: "var(--md-primary)" }}
              initial={{ width: 0 }}
              animate={{ width: `${electricPct}%` }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 right-0"
              style={{ background: "var(--color-fuel)" }}
              initial={{ width: 0 }}
              animate={{ width: `${fuelPct}%` }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>

          <div className="flex justify-between text-xs gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: "var(--md-primary)" }}
              />
              <div>
                <span style={{ color: "var(--md-on-surface-variant)" }}>Eléctrico </span>
                <span className="font-semibold" style={{ color: "var(--md-on-surface)" }}>
                  {Math.round(electricPct)}%
                </span>
                <span className="ml-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  · {formatKwh(totalKwh)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: "var(--color-fuel)" }}
              />
              <div>
                <span style={{ color: "var(--md-on-surface-variant)" }}>Combustible </span>
                <span className="font-semibold" style={{ color: "var(--md-on-surface)" }}>
                  {Math.round(fuelPct)}%
                </span>
                <span className="ml-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  · {formatCurrency(stats.totalFuelCost)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          {/* Cost per km */}
          <div className="card-outlined p-4">
            <div
              className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center mb-3"
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
              }}
            >
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--md-on-surface)" }}
            >
              {formatCurrency(stats.averageCostPerKm)}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Costo por km
            </p>
            <p
              className="text-[10px] mt-0.5 font-medium"
              style={{ color: "var(--md-on-surface-variant)", opacity: 0.7 }}
            >
              {formatKm(stats.totalKmDriven)} totales
            </p>
          </div>

          {/* Next service */}
          <div className="card-outlined p-4">
            <div
              className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center mb-3"
              style={{
                background: "var(--color-service-container)",
                color: "var(--color-service)",
              }}
            >
              <Wrench className="w-4.5 h-4.5" />
            </div>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--md-on-surface)" }}
            >
              {formatKm(stats.nextServiceKm)}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Próximo servicio
            </p>
            <p
              className="text-[10px] mt-0.5 font-medium"
              style={{ color: "var(--md-on-surface-variant)", opacity: 0.7 }}
            >
              km restantes
            </p>
          </div>
        </motion.div>

        {/* ── Cost Breakdown ── */}
        <motion.div variants={fadeUp} className="card-filled p-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="type-label-sm"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Costos Acumulados
            </h2>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--md-on-surface)" }}
            >
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Electricidad",
                value: stats.totalChargeCost,
                icon: Zap,
                iconBg: "var(--md-primary-container)",
                iconColor: "var(--md-on-primary-container)",
                barColor: "var(--md-primary)",
              },
              {
                label: "Combustible",
                value: stats.totalFuelCost,
                icon: Fuel,
                iconBg: "var(--color-fuel-container)",
                iconColor: "var(--color-fuel)",
                barColor: "var(--color-fuel)",
              },
              {
                label: "Estacionamiento",
                value: totalParkingCost,
                icon: ParkingCircle,
                iconBg: "var(--color-parking-container)",
                iconColor: "var(--color-parking)",
                barColor: "var(--color-parking)",
              },
              {
                label: "Mantenimiento",
                value: stats.totalMaintenanceCost,
                icon: Wrench,
                iconBg: "var(--color-service-container)",
                iconColor: "var(--color-service)",
                barColor: "var(--color-service)",
              },
            ].map((item) => {
              const pct = grandTotal > 0 ? (item.value / grandTotal) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[var(--shape-sm)] flex items-center justify-center shrink-0"
                    style={{ background: item.iconBg, color: item.iconColor }}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--md-on-surface-variant)" }}>
                        {item.label}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--md-on-surface)" }}
                      >
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--md-surface-container-highest)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.barColor }}
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

        {/* ── Recent Activity ── */}
        <motion.div variants={fadeUp}>
          <ActivityList activities={recentActivities} maxItems={5} showViewAll />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
