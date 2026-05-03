"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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
  Pencil,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function ChargesPage() {
  const { charges } = useStore();
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

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page title + CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--md-on-surface)", fontFamily: "var(--font-display, 'Space Grotesk', system-ui)" }}>
              Cargas
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
              Historial eléctrico
            </p>
          </div>
          <Link href="/charges/new">
            <Button variant="filled" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cargas", value: String(charges.length), color: "var(--md-primary)" },
            { label: "Total kWh", value: formatKwh(totalKwh) },
            { label: "Costo total", value: formatCurrency(totalCost) },
          ].map((stat) => (
            <div key={stat.label} className="card-filled p-3 text-center">
              <p
                className="text-xl font-bold"
                style={{ color: stat.color ?? "var(--md-on-surface)", fontFamily: "var(--font-display, system-ui)" }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--md-on-surface-variant)" }}
            />
            <Input
              placeholder="Buscar por ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] h-11">
              <Filter className="w-4 h-4 mr-1.5" style={{ color: "var(--md-on-surface-variant)" }} />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(CHARGE_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {filteredCharges.length === 0 ? (
            <div
              className="card-outlined text-center py-14 px-6"
            >
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ background: "var(--md-primary-container)" }}
              >
                <Zap className="w-7 h-7" style={{ color: "var(--md-on-primary-container)" }} />
              </div>
              <p className="font-semibold text-base" style={{ color: "var(--md-on-surface)" }}>
                Sin cargas registradas
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
                Registra tu primera carga para comenzar
              </p>
              <Link href="/charges/new" className="mt-5 inline-block">
                <Button variant="filled" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Carga
                </Button>
              </Link>
            </div>
          ) : (
            filteredCharges.map((charge) => (
              <div
                key={charge.id}
                className="card-outlined p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--md-primary-container)",
                        color: "var(--md-on-primary-container)",
                      }}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate" style={{ color: "var(--md-on-surface)" }}>
                        {charge.location}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(charge.date)}
                        </span>
                        <span>{CHARGE_TYPES[charge.chargeType]}</span>
                        {charge.batteryStartPercent != null &&
                          charge.batteryEndPercent != null && (
                            <span style={{ color: "var(--md-primary)" }}>
                              {charge.batteryStartPercent}% → {charge.batteryEndPercent}%
                            </span>
                          )}
                        {charge.durationMinutes && (
                          <span>{charge.durationMinutes} min</span>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {charge.isFree && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: "var(--md-tertiary-container)",
                              color: "var(--md-on-tertiary-container)",
                            }}
                          >
                            Gratis
                          </span>
                        )}
                        {charge.parkingCostPEN > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: "var(--color-parking-container)",
                              color: "var(--color-parking)",
                            }}
                          >
                            Parking S/ {charge.parkingCostPEN.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: "var(--md-on-surface)" }}>
                      {formatKwh(charge.kwhCharged)}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: "var(--md-primary)" }}>
                      {formatCurrency(charge.totalCost)}
                    </p>
                    <Link href={`/charges/${charge.id}/edit`}>
                      <Button variant="ghost" size="icon" className="mt-1 h-7 w-7"
                        style={{ color: "var(--md-on-surface-variant)" } as React.CSSProperties}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
