"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  const { services, deleteService, vehicle } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services
    .filter((service) => {
      return (
        service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCost = services.reduce((sum, s) => sum + s.costPEN, 0);

  // Calculate next service
  const lastService = services
    .filter((s) => s.serviceType.toLowerCase().includes("servicio"))
    .sort((a, b) => b.odometer - a.odometer)[0];
  const lastServiceKm = lastService?.odometer || 0;
  const nextServiceKm =
    Math.ceil((lastServiceKm + 1) / 10000) * 10000;
  const kmToNextService = nextServiceKm - vehicle.currentOdometer;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mantenimiento</h1>
            <p className="text-[var(--muted-foreground)]">
              Historial de servicios y mantenimiento
            </p>
          </div>
          <Link href="/maintenance/new">
            <Button variant="cyan" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Servicio
            </Button>
          </Link>
        </div>

        {/* Next Service Alert */}
        <GlassCard
          className={
            kmToNextService <= 1000
              ? "border-[var(--deepal-warning)]/50 bg-[var(--deepal-warning)]/5"
              : ""
          }
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`w-5 h-5 mt-0.5 ${
                kmToNextService <= 1000
                  ? "text-[var(--deepal-warning)]"
                  : "text-[var(--deepal-blue)]"
              }`}
            />
            <div>
              <p className="font-medium">Proximo Servicio</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {kmToNextService > 0 ? (
                  <>
                    Faltan <span className="font-bold">{formatKm(kmToNextService)}</span> para
                    el proximo servicio programado a los {formatKm(nextServiceKm)}.
                  </>
                ) : (
                  <>
                    Ya pasaste el kilometraje para el servicio. Agenda una cita
                    pronto.
                  </>
                )}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Servicios
            </p>
            <p className="text-2xl font-bold text-[var(--deepal-blue)]">
              {services.length}
            </p>
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
            placeholder="Buscar por tipo de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServices.length === 0 ? (
            <GlassCard className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-lg font-medium">No hay servicios registrados</p>
              <p className="text-[var(--muted-foreground)] mt-1">
                Registra el primer servicio de tu vehiculo
              </p>
              <Link href="/maintenance/new" className="mt-4 inline-block">
                <Button variant="cyan" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Servicio
                </Button>
              </Link>
            </GlassCard>
          ) : (
            filteredServices.map((service) => (
              <GlassCard
                key={service.id}
                className="hover:border-[var(--deepal-blue)]/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--deepal-blue)]/10">
                      <Wrench className="w-5 h-5 text-[var(--deepal-blue)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{service.serviceType}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--muted-foreground)]">
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
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          {service.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-[var(--deepal-blue)]">
                      {formatCurrency(service.costPEN)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Maintenance Schedule Info */}
        <GlassCard>
          <h3 className="font-semibold mb-4">Programa de Mantenimiento</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">
                1er Servicio
              </span>
              <span>5,000 km - S/ 250-350</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">
                2do Servicio
              </span>
              <span>15,000 km - S/ 300-400</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">
                3er Servicio
              </span>
              <span>25,000 km - S/ 350-450</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--muted-foreground)]">
                Servicio Mayor
              </span>
              <span>40,000 km - S/ 600-800</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
