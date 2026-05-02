"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, formatKm } from "@/lib/utils";
import {
  Plus,
  Wrench,
  Search,
  Trash2,
  Calendar,
  Gauge,
  Building,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  const { services, deleteService, vehicle } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services
    .filter(
      (service) =>
        service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCost = services.reduce((sum, s) => sum + s.costPEN, 0);

  const lastService = services
    .filter((s) => s.serviceType.toLowerCase().includes("servicio"))
    .sort((a, b) => b.odometer - a.odometer)[0];
  const lastServiceKm = lastService?.odometer || 0;
  const nextServiceKm = Math.ceil((lastServiceKm + 1) / 10000) * 10000;
  const kmToNextService = nextServiceKm - vehicle.currentOdometer;
  const isUrgent = kmToNextService <= 1000;

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
              Mantenimiento
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
              Servicios y mantenimiento
            </p>
          </div>
          <Link href="/maintenance/new">
            <Button variant="filled" size="sm" className="gap-2"
              style={{ background: "var(--color-service)", color: "white" } as React.CSSProperties}
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          </Link>
        </div>

        {/* Next service alert */}
        <div
          className="rounded-[var(--shape-lg)] p-4 flex items-start gap-3"
          style={{
            background: isUrgent
              ? "var(--md-error-container)"
              : "var(--color-service-container)",
            color: isUrgent
              ? "var(--md-on-error-container)"
              : "var(--color-service-on-container)",
          }}
        >
          {isUrgent ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--md-error)" }} />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-service)" }} />
          )}
          <div>
            <p className="font-semibold text-sm">Próximo Servicio</p>
            <p className="text-xs mt-0.5" style={{ opacity: 0.85 }}>
              {kmToNextService > 0 ? (
                <>
                  Faltan <span className="font-bold">{formatKm(kmToNextService)}</span> para el
                  servicio programado a los {formatKm(nextServiceKm)}.
                </>
              ) : (
                "Ya pasaste el kilometraje para el servicio. Agenda una cita."
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Servicios", value: String(services.length), color: "var(--color-service)" },
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
            placeholder="Buscar por tipo de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {filteredServices.length === 0 ? (
            <div className="card-outlined text-center py-14 px-6">
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ background: "var(--color-service-container)" }}
              >
                <Wrench className="w-7 h-7" style={{ color: "var(--color-service)" }} />
              </div>
              <p className="font-semibold text-base" style={{ color: "var(--md-on-surface)" }}>
                Sin servicios registrados
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
                Registra el primer servicio de tu vehículo
              </p>
              <Link href="/maintenance/new" className="mt-5 inline-block">
                <Button variant="filled" className="gap-2"
                  style={{ background: "var(--color-service)" } as React.CSSProperties}
                >
                  <Plus className="w-4 h-4" />
                  Registrar Servicio
                </Button>
              </Link>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div key={service.id} className="card-outlined p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--color-service-container)",
                        color: "var(--color-service)",
                      }}
                    >
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--md-on-surface)" }}
                      >
                        {service.serviceType}
                      </h3>
                      <div
                        className="flex flex-wrap gap-2 mt-1 text-xs"
                        style={{ color: "var(--md-on-surface-variant)" }}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(service.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {formatKm(service.odometer)}
                        </span>
                        {service.provider && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {service.provider}
                          </span>
                        )}
                      </div>
                      {service.notes && (
                        <p
                          className="text-xs mt-1 truncate"
                          style={{ color: "var(--md-on-surface-variant)" }}
                        >
                          {service.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-bold text-sm"
                      style={{ color: "var(--color-service)" }}
                    >
                      {formatCurrency(service.costPEN)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 h-7 w-7"
                      style={{ color: "var(--md-error)" } as React.CSSProperties}
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Maintenance schedule */}
        <div className="card-outlined p-4">
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--md-on-surface)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Programa de Mantenimiento
          </h3>
          <div className="space-y-0">
            {[
              { label: "1er Servicio", km: "5,000 km", cost: "S/ 250–350" },
              { label: "2do Servicio", km: "15,000 km", cost: "S/ 300–400" },
              { label: "3er Servicio", km: "25,000 km", cost: "S/ 350–450" },
              { label: "Servicio Mayor", km: "40,000 km", cost: "S/ 600–800" },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex justify-between py-2.5 text-sm"
                style={{
                  borderBottom: i < arr.length - 1 ? "1px solid var(--md-outline-variant)" : undefined,
                }}
              >
                <span style={{ color: "var(--md-on-surface-variant)" }}>{item.label}</span>
                <div className="text-right">
                  <span className="font-medium" style={{ color: "var(--md-on-surface)" }}>
                    {item.km}
                  </span>
                  <span style={{ color: "var(--md-on-surface-variant)" }}> · {item.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
