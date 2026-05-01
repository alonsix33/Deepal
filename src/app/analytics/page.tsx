"use client";

import React, { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const COLORS = {
  cyan: "#00D4FF",
  warning: "#FFA500",
  blue: "#0095FF",
  teal: "#00CED1",
  gray: "#8A8A8A",
};

export default function AnalyticsPage() {
  const { charges, fuelUps, services, getDashboardStats } = useStore();
  const stats = getDashboardStats();

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const months: Record<
      string,
      { month: string; electric: number; fuel: number; maintenance: number }
    > = {};

    charges.forEach((charge) => {
      const month = new Date(charge.date).toLocaleDateString("es-PE", {
        month: "short",
        year: "2-digit",
      });
      if (!months[month]) {
        months[month] = { month, electric: 0, fuel: 0, maintenance: 0 };
      }
      months[month].electric += charge.totalCost;
    });

    fuelUps.forEach((fuelUp) => {
      const month = new Date(fuelUp.date).toLocaleDateString("es-PE", {
        month: "short",
        year: "2-digit",
      });
      if (!months[month]) {
        months[month] = { month, electric: 0, fuel: 0, maintenance: 0 };
      }
      months[month].fuel += fuelUp.costPEN;
    });

    services.forEach((service) => {
      const month = new Date(service.date).toLocaleDateString("es-PE", {
        month: "short",
        year: "2-digit",
      });
      if (!months[month]) {
        months[month] = { month, electric: 0, fuel: 0, maintenance: 0 };
      }
      months[month].maintenance += service.costPEN;
    });

    return Object.values(months).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [charges, fuelUps, services]);

  // Usage distribution data
  const usageData = useMemo(() => {
    const totalElectric = charges.reduce((sum, c) => sum + c.totalCost, 0);
    const totalFuel = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);

    if (totalElectric === 0 && totalFuel === 0) {
      return [{ name: "Sin datos", value: 100, color: COLORS.gray }];
    }

    return [
      { name: "Eléctrico", value: totalElectric, color: COLORS.cyan },
      { name: "Combustible", value: totalFuel, color: COLORS.warning },
    ].filter((d) => d.value > 0);
  }, [charges, fuelUps]);

  // kWh charged per month
  const kwhData = useMemo(() => {
    const months: Record<string, { month: string; kwh: number }> = {};

    charges.forEach((charge) => {
      const month = new Date(charge.date).toLocaleDateString("es-PE", {
        month: "short",
      });
      if (!months[month]) {
        months[month] = { month, kwh: 0 };
      }
      months[month].kwh += charge.kwhCharged;
    });

    return Object.values(months);
  }, [charges]);

  // Charging locations breakdown
  const locationData = useMemo(() => {
    const locations: Record<string, number> = {};

    charges.forEach((charge) => {
      const loc = charge.location;
      locations[loc] = (locations[loc] || 0) + 1;
    });

    return Object.entries(locations)
      .map(([name, value], index) => ({
        name,
        value,
        color: Object.values(COLORS)[index % Object.values(COLORS).length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [charges]);

  const hasData = charges.length > 0 || fuelUps.length > 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p className="text-[var(--muted-foreground)]">
            Análisis de consumo y costos
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--deepal-cyan)]/10">
                <Zap className="w-5 h-5 text-[var(--deepal-cyan)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Costo Eléctrico
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalChargeCost)}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--deepal-warning)]/10">
                <Fuel className="w-5 h-5 text-[var(--deepal-warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Costo Combustible
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalFuelCost)}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--deepal-blue)]/10">
                <TrendingUp className="w-5 h-5 text-[var(--deepal-blue)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Costo/km
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.averageCostPerKm)}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--deepal-teal)]/10">
                <PieChartIcon className="w-5 h-5 text-[var(--deepal-teal)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Uso Eléctrico
                </p>
                <p className="text-xl font-bold">
                  {Math.round(stats.electricUsagePercent)}%
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {!hasData ? (
          <GlassCard className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
            <p className="text-lg font-medium">No hay datos para mostrar</p>
            <p className="text-[var(--muted-foreground)] mt-1">
              Registra cargas y consumos para ver las estadísticas
            </p>
          </GlassCard>
        ) : (
          <Tabs defaultValue="costs" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="costs">Costos</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="charging">Cargas</TabsTrigger>
            </TabsList>

            {/* Costs Tab */}
            <TabsContent value="costs" className="space-y-6">
              <GlassCard>
                <h3 className="font-semibold mb-4">Costos Mensuales</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                      />
                      <Legend />
                      <Bar
                        dataKey="electric"
                        name="Eléctrico"
                        fill={COLORS.cyan}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="fuel"
                        name="Combustible"
                        fill={COLORS.warning}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="maintenance"
                        name="Mantenimiento"
                        fill={COLORS.blue}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <h3 className="font-semibold mb-4">
                    Distribución de Energía
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {usageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => formatCurrency(Number(value) || 0)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="font-semibold mb-4">Ubicaciones de Carga</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Charging Tab */}
            <TabsContent value="charging" className="space-y-6">
              <GlassCard>
                <h3 className="font-semibold mb-4">kWh Cargados por Mes</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kwhData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => formatKwh(Number(value) || 0)}
                      />
                      <Line
                        type="monotone"
                        dataKey="kwh"
                        name="kWh"
                        stroke={COLORS.cyan}
                        strokeWidth={3}
                        dot={{ fill: COLORS.cyan, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Charging Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total Cargas
                  </p>
                  <p className="text-2xl font-bold">{charges.length}</p>
                </GlassCard>
                <GlassCard className="text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total kWh
                  </p>
                  <p className="text-2xl font-bold">
                    {formatKwh(charges.reduce((s, c) => s + c.kwhCharged, 0))}
                  </p>
                </GlassCard>
                <GlassCard className="text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Costo Promedio
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      charges.length > 0
                        ? stats.totalChargeCost / charges.length
                        : 0
                    )}
                  </p>
                </GlassCard>
                <GlassCard className="text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    kWh Promedio
                  </p>
                  <p className="text-2xl font-bold">
                    {formatKwh(
                      charges.length > 0
                        ? charges.reduce((s, c) => s + c.kwhCharged, 0) /
                            charges.length
                        : 0
                    )}
                  </p>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
