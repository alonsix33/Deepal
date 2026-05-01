"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, formatKwh } from "@/lib/utils";
import { CHARGE_TYPES, CHARGE_LOCATIONS } from "@/types";
import {
  Plus,
  Zap,
  Search,
  Filter,
  Trash2,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function ChargesPage() {
  const { charges, deleteCharge } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredCharges = charges
    .filter((charge) => {
      const matchesSearch =
        charge.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || charge.chargeType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalKwh = charges.reduce((sum, c) => sum + c.kwhCharged, 0);
  const totalCost = charges.reduce((sum, c) => sum + c.totalCost, 0);
  const avgCostPerKwh = totalKwh > 0 ? totalCost / totalKwh : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cargas</h1>
            <p className="text-[var(--muted-foreground)]">
              Historial de cargas eléctricas
            </p>
          </div>
          <Link href="/charges/new">
            <Button variant="cyan" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Carga
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Cargas
            </p>
            <p className="text-2xl font-bold text-[var(--deepal-cyan)]">
              {charges.length}
            </p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Total kWh</p>
            <p className="text-2xl font-bold">{formatKwh(totalKwh)}</p>
          </GlassCard>
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Costo Total
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </GlassCard>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Buscar por ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo de carga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(CHARGE_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Charges List */}
        <div className="space-y-3">
          {filteredCharges.length === 0 ? (
            <GlassCard className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-lg font-medium">No hay cargas registradas</p>
              <p className="text-[var(--muted-foreground)] mt-1">
                Registra tu primera carga para comenzar
              </p>
              <Link href="/charges/new" className="mt-4 inline-block">
                <Button variant="cyan" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Carga
                </Button>
              </Link>
            </GlassCard>
          ) : (
            filteredCharges.map((charge) => (
              <GlassCard
                key={charge.id}
                className="hover:border-[var(--deepal-cyan)]/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-[var(--deepal-cyan)]/10 shrink-0">
                      <Zap className="w-4 h-4 text-[var(--deepal-cyan)]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{charge.location}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(charge.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          {CHARGE_TYPES[charge.chargeType]}
                        </span>
                        {charge.batteryStartPercent != null && charge.batteryEndPercent != null && (
                          <span className="flex items-center gap-1 text-[var(--deepal-cyan)]">
                            {charge.batteryStartPercent}% → {charge.batteryEndPercent}%
                          </span>
                        )}
                        {charge.durationMinutes && (
                          <span className="flex items-center gap-1">
                            {charge.durationMinutes} min
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        {charge.isFree && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--deepal-teal)]/10 text-[var(--deepal-teal)]">
                            Gratis
                          </span>
                        )}
                        {charge.parkingCostPEN > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--deepal-warning)]/10 text-[var(--deepal-warning)]">
                            Parking S/ {charge.parkingCostPEN.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {charge.notes && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                          {charge.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-sm">{formatKwh(charge.kwhCharged)}</p>
                    <p className="text-xs text-[var(--deepal-cyan)]">{formatCurrency(charge.totalCost)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 h-7 w-7 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      onClick={() => deleteCharge(charge.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
