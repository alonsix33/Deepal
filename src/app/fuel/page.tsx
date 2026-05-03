"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, formatKm } from "@/lib/utils";
import {
  Plus,
  Fuel,
  Search,
  Pencil,
  Calendar,
  Gauge,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function FuelPage() {
  const { fuelUps } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFuelUps = fuelUps
    .filter(
      (fuelUp) =>
        fuelUp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fuelUp.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalGallons = fuelUps.reduce((sum, f) => sum + f.gallons, 0);
  const totalCost = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page title */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: "var(--md-on-surface)",
                fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
              }}
            >
              Combustible
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
              Historial de gasolina
            </p>
          </div>
          <Link href="/fuel/new">
            <Button variant="filled" size="sm" className="gap-2"
              style={{ background: "var(--color-fuel)", color: "white" } as React.CSSProperties}
            >
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          </Link>
        </div>

        {/* REEV info banner */}
        <div
          className="rounded-[var(--shape-lg)] p-4 flex items-start gap-3"
          style={{
            background: "var(--color-fuel-container)",
            color: "var(--color-fuel-on-container)",
          }}
        >
          <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-fuel)" }} />
          <div>
            <p className="font-semibold text-sm">Vehículo REEV</p>
            <p className="text-xs mt-0.5" style={{ opacity: 0.85 }}>
              El motor de gasolina del S05 solo genera electricidad y nunca impulsa
              las ruedas directamente. Idealmente usarás combustible raramente.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Recargas", value: String(fuelUps.length), color: "var(--color-fuel)" },
            { label: "Galones", value: `${totalGallons.toFixed(1)} gal` },
            { label: "Costo total", value: formatCurrency(totalCost) },
          ].map((stat) => (
            <div key={stat.label} className="card-filled p-3 text-center">
              <p
                className="text-xl font-bold"
                style={{
                  color: stat.color ?? "var(--md-on-surface)",
                  fontFamily: "var(--font-display, system-ui)",
                }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
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

        {/* List */}
        <div className="space-y-2.5">
          {filteredFuelUps.length === 0 ? (
            <div className="card-outlined text-center py-14 px-6">
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ background: "var(--color-fuel-container)" }}
              >
                <Fuel className="w-7 h-7" style={{ color: "var(--color-fuel)" }} />
              </div>
              <p className="font-semibold text-base" style={{ color: "var(--md-on-surface)" }}>
                {fuelUps.length === 0
                  ? "Sin cargas de combustible"
                  : "Sin resultados"}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
                {fuelUps.length === 0
                  ? "Excelente — estás usando 100% electricidad"
                  : "Intenta con otro término de búsqueda"}
              </p>
            </div>
          ) : (
            filteredFuelUps.map((fuelUp) => (
              <div key={fuelUp.id} className="card-outlined p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--color-fuel-container)",
                        color: "var(--color-fuel)",
                      }}
                    >
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--md-on-surface)" }}
                      >
                        {fuelUp.location || "Gasolinera"}
                      </h3>
                      <div
                        className="flex flex-wrap gap-2 mt-1 text-xs"
                        style={{ color: "var(--md-on-surface-variant)" }}
                      >
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
                        <p
                          className="text-xs mt-1 truncate"
                          style={{ color: "var(--md-on-surface-variant)" }}
                        >
                          {fuelUp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: "var(--md-on-surface)" }}>
                      {fuelUp.gallons.toFixed(1)} gal
                    </p>
                    <p className="text-xs font-semibold" style={{ color: "var(--color-fuel)" }}>
                      {formatCurrency(fuelUp.costPEN)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--md-on-surface-variant)" }}>
                      {formatCurrency(fuelUp.costPerGallon)}/gal
                    </p>
                    <Link href={`/fuel/${fuelUp.id}/edit`}>
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
