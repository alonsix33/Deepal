"use client";

import React, { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatKwh } from "@/lib/utils";
import {
  BarChart3,
  Zap,
  Fuel,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// MD3 palette — usar valores de CSS vars resueltos en hex para Recharts
// (Recharts no puede leer CSS variables directamente)
const CHART_COLORS = {
  primary: "#0057CC",
  fuel: "#8B4800",
  secondary: "#4F5F7A",
  tertiary: "#006C51",
  outline: "#717B89",
};

const CHART_COLORS_DARK = {
  primary: "#A8C8FF",
  fuel: "#FFB870",
  secondary: "#B9C7E0",
  tertiary: "#6BDBB1",
  outline: "#8B96A2",
};

function useChartColors() {
  if (typeof document !== "undefined") {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? CHART_COLORS_DARK : CHART_COLORS;
  }
  return CHART_COLORS;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}

function MD3Tooltip({ active, payload, label, formatter }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[var(--shape-md)] px-3 py-2.5 text-xs shadow-lg"
      style={{
        background: "var(--md-surface-container-highest)",
        border: "1px solid var(--md-outline-variant)",
        color: "var(--md-on-surface)",
      }}
    >
      {label && (
        <p className="font-semibold mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
          {label}
        </p>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: "var(--md-on-surface-variant)" }}>{entry.name}: </span>
          <span className="font-medium">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { charges, fuelUps, services, getDashboardStats } = useStore();
  const stats = getDashboardStats();
  const colors = useChartColors();

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; electric: number; fuel: number; maintenance: number; sortKey: number }> = {};

    const upsert = (date: Date, field: "electric" | "fuel" | "maintenance", amount: number) => {
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = {
          month: date.toLocaleDateString("es-PE", { month: "short", year: "2-digit" }),
          electric: 0, fuel: 0, maintenance: 0,
          sortKey: date.getFullYear() * 100 + date.getMonth(),
        };
      }
      months[key][field] += amount;
    };

    charges.forEach((c) => upsert(new Date(c.date), "electric", c.totalCost));
    fuelUps.forEach((f) => upsert(new Date(f.date), "fuel", f.costPEN));
    services.forEach((s) => upsert(new Date(s.date), "maintenance", s.costPEN));

    return Object.values(months)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, electric, fuel, maintenance }) => ({ month, electric, fuel, maintenance }));
  }, [charges, fuelUps, services]);

  const usageData = useMemo(() => {
    const totalElectric = charges.reduce((sum, c) => sum + c.totalCost, 0);
    const totalFuel = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);
    if (totalElectric === 0 && totalFuel === 0) {
      return [{ name: "Sin datos", value: 100, color: colors.outline }];
    }
    return [
      { name: "Eléctrico", value: totalElectric, color: colors.primary },
      { name: "Combustible", value: totalFuel, color: colors.fuel },
    ].filter((d) => d.value > 0);
  }, [charges, fuelUps, colors]);

  const kwhData = useMemo(() => {
    const months: Record<string, { month: string; kwh: number; sortKey: number }> = {};
    charges.forEach((charge) => {
      const d = new Date(charge.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = {
          month: d.toLocaleDateString("es-PE", { month: "short" }),
          kwh: 0,
          sortKey: d.getFullYear() * 100 + d.getMonth(),
        };
      }
      months[key].kwh += charge.kwhCharged;
    });
    return Object.values(months)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, kwh }) => ({ month, kwh }));
  }, [charges]);

  const locationData = useMemo(() => {
    const locations: Record<string, number> = {};
    charges.forEach((charge) => {
      locations[charge.location] = (locations[charge.location] || 0) + 1;
    });
    const palette = [colors.primary, colors.fuel, colors.secondary, colors.tertiary, colors.outline];
    return Object.entries(locations)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value);
  }, [charges, colors]);

  const hasData = charges.length > 0 || fuelUps.length > 0;

  const axisStyle = { fill: "var(--md-on-surface-variant)", fontSize: 11 };

  const summaryCards = [
    {
      label: "Costo Eléctrico",
      value: formatCurrency(stats.totalChargeCost),
      icon: Zap,
      iconBg: "var(--md-primary-container)",
      iconColor: "var(--md-on-primary-container)",
    },
    {
      label: "Costo Combustible",
      value: formatCurrency(stats.totalFuelCost),
      icon: Fuel,
      iconBg: "var(--color-fuel-container)",
      iconColor: "var(--color-fuel)",
    },
    {
      label: "Costo/km",
      value: formatCurrency(stats.averageCostPerKm),
      icon: TrendingUp,
      iconBg: "var(--md-secondary-container)",
      iconColor: "var(--md-on-secondary-container)",
    },
    {
      label: "Uso Eléctrico",
      value: `${Math.round(stats.electricUsagePercent)}%`,
      icon: PieChartIcon,
      iconBg: "var(--md-tertiary-container)",
      iconColor: "var(--md-on-tertiary-container)",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 pb-4">
        {/* Page title */}
        <div className="pt-1">
          <h1
            className="text-2xl font-bold"
            style={{
              color: "var(--md-on-surface)",
              fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
            }}
          >
            Estadísticas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
            Análisis de consumo y costos
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card-outlined p-4">
                <div
                  className="w-8 h-8 rounded-[var(--shape-sm)] flex items-center justify-center mb-3"
                  style={{ background: card.iconBg, color: card.iconColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--md-on-surface)" }}
                >
                  {card.value}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>

        {!hasData ? (
          <div className="card-outlined text-center py-14 px-6">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: "var(--md-primary-container)" }}
            >
              <BarChart3 className="w-7 h-7" style={{ color: "var(--md-on-primary-container)" }} />
            </div>
            <p className="font-semibold text-base" style={{ color: "var(--md-on-surface)" }}>
              No hay datos para mostrar
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
              Registra cargas y consumos para ver las estadísticas
            </p>
          </div>
        ) : (
          <Tabs defaultValue="costs" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="costs">Costos</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="charging">Cargas</TabsTrigger>
            </TabsList>

            {/* Costos */}
            <TabsContent value="costs" className="space-y-4">
              <div className="card-filled p-4">
                <h3
                  className="font-semibold text-sm mb-4"
                  style={{ color: "var(--md-on-surface)" }}
                >
                  Costos Mensuales
                </h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--md-outline-variant)" />
                      <XAxis dataKey="month" tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip
                        content={<MD3Tooltip formatter={(v) => formatCurrency(v)} />}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11, color: "var(--md-on-surface-variant)" }}
                      />
                      <Bar dataKey="electric" name="Eléctrico" fill={colors.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fuel" name="Combustible" fill={colors.fuel} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenance" name="Mantenimiento" fill={colors.secondary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Uso */}
            <TabsContent value="usage" className="space-y-4">
              <div className="card-filled p-4">
                <h3
                  className="font-semibold text-sm mb-4"
                  style={{ color: "var(--md-on-surface)" }}
                >
                  Distribución de Energía
                </h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {usageData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<MD3Tooltip formatter={(v) => formatCurrency(v)} />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "var(--md-on-surface-variant)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card-filled p-4">
                <h3
                  className="font-semibold text-sm mb-4"
                  style={{ color: "var(--md-on-surface)" }}
                >
                  Ubicaciones de Carga
                </h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {locationData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<MD3Tooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "var(--md-on-surface-variant)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Cargas */}
            <TabsContent value="charging" className="space-y-4">
              <div className="card-filled p-4">
                <h3
                  className="font-semibold text-sm mb-4"
                  style={{ color: "var(--md-on-surface)" }}
                >
                  kWh Cargados por Mes
                </h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kwhData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--md-outline-variant)" />
                      <XAxis dataKey="month" tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip content={<MD3Tooltip formatter={(v) => formatKwh(v)} />} />
                      <Line
                        type="monotone"
                        dataKey="kwh"
                        name="kWh"
                        stroke={colors.primary}
                        strokeWidth={2.5}
                        dot={{ fill: colors.primary, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charging stats strip */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total cargas", value: String(charges.length) },
                  {
                    label: "Total kWh",
                    value: formatKwh(charges.reduce((s, c) => s + c.kwhCharged, 0)),
                  },
                  {
                    label: "Costo promedio",
                    value: formatCurrency(
                      charges.length > 0 ? stats.totalChargeCost / charges.length : 0
                    ),
                  },
                  {
                    label: "kWh promedio",
                    value: formatKwh(
                      charges.length > 0
                        ? charges.reduce((s, c) => s + c.kwhCharged, 0) / charges.length
                        : 0
                    ),
                  },
                ].map((s) => (
                  <div key={s.label} className="card-outlined p-4 text-center">
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: "var(--md-on-surface)",
                        fontFamily: "var(--font-display, system-ui)",
                      }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
