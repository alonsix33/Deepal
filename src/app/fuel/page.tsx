"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, formatLiters, formatKm } from "@/lib/utils";
import {
  Plus,
  Fuel,
  Search,
  Trash2,
  Calendar,
  MapPin,
  Gauge,
} from "lucide-react";
import Link from "next/link";

export default function FuelPage() {
  const { fuelUps, deleteFuelUp } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFuelUps = fuelUps
    .filter((fuelUp) => {
      return (
        fuelUp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fuelUp.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalLiters = fuelUps.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);
  const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Combustible</h1>
            <p className="text-[var(--muted-foreground)]">
              Historial de cargas de gasolina
            </p>
          </div>
          <Link href="/fuel/new">
            <Button variant="cyan" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Carga
            </Button>
          </Link>
        </div>

        {/* Info Banner */}
        <GlassCard className="border-[var(--deepal-warning)]/30 bg-[var(--deepal-warning)]/5">
          <div className="flex items-start gap-3">
            <Fuel className="w-5 h-5 text-[var(--deepal-warning)] mt-0.5" />
            <div>
              <p className="font-medium">Vehículo REEV</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                El Deepal S05 es un REEV (Range Extended EV). El motor de
                gasolina solo genera electricidad y nunca impulsa las ruedas
                directamente. Idealmente, usarás combustible muy raramente.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Cargas
            </p>
            <p className="text-2xl font-bold text-[var(--deepal-warning)]">
              {fuelUps.length}
            </p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Litros
            </p>
            <p className="text-2xl font-bold">{formatLiters(totalLiters)}</p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Costo Total
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </GlassCard>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Fuel Ups List */}
        <div className="space-y-3">
          {filteredFuelUps.length === 0 ? (
            <GlassCard className="text-center py-12">
              <Fuel className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-lg font-medium">
                No hay cargas de combustible
              </p>
              <p className="text-[var(--muted-foreground)] mt-1">
                {fuelUps.length === 0
                  ? "Excelente! Estás usando energía eléctrica"
                  : "No se encontraron resultados"}
              </p>
              {fuelUps.length === 0 && (
                <Link href="/fuel/new" className="mt-4 inline-block">
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Registrar si es necesario
                  </Button>
                </Link>
              )}
            </GlassCard>
          ) : (
            filteredFuelUps.map((fuelUp) => (
              <GlassCard
                key={fuelUp.id}
                className="hover:border-[var(--deepal-warning)]/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--deepal-warning)]/10">
                      <Fuel className="w-5 h-5 text-[var(--deepal-warning)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {fuelUp.location || "Gasolinera"}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(fuelUp.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {formatKm(fuelUp.odometer)}
                        </span>
                      </div>
                      {fuelUp.notes && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          {fuelUp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatLiters(fuelUp.liters)}
                    </p>
                    <p className="text-[var(--deepal-warning)]">
                      {formatCurrency(fuelUp.costPEN)}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatCurrency(fuelUp.costPerLiter)}/L
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      onClick={() => deleteFuelUp(fuelUp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
