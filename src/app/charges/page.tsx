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
  const totalCost = charges.reduce((sum, c) => sum + c.costPEN, 0);
  const avgCostPerKwh = totalKwh > 0 ? totalCost / totalKwh : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cargas</h1>
            <p className="text-[var(--muted-foreground)]">
              Historial de cargas electricas
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
              placeholder="Buscar por ubicacion..."
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
                className="hover:border-[var(--primary)]/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--deepal-cyan)]/10">
                      <Zap className="w-5 h-5 text-[var(--deepal-cyan)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{charge.location}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(charge.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {CHARGE_TYPES[charge.chargeType]}
                        </span>
                        {charge.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {charge.durationMinutes} min
                          </span>
                        )}
                      </div>
                      {charge.notes && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          {charge.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatKwh(charge.kwhCharged)}
                    </p>
                    <p className="text-[var(--deepal-cyan)]">
                      {formatCurrency(charge.costPEN)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      onClick={() => deleteCharge(charge.id)}
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
