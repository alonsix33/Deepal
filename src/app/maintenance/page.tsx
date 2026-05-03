"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, formatKm } from "@/lib/utils";
import {
  computeServiceProjection,
  getAllServiceMilestones,
  formatProjectionDate,
} from "@/lib/serviceProjection";
import { motion } from "framer-motion";
import {
  Plus,
  Wrench,
  Search,
  Pencil,
  Calendar,
  Gauge,
  Building,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Info,
} from "lucide-react";
import Link from "next/link";

const CONFIDENCE_CONFIG = {
  high: {
    label: "Confianza alta",
    color: "var(--md-tertiary)",
    bg: "var(--md-tertiary-container)",
    text: "var(--md-on-tertiary-container)",
  },
  medium: {
    label: "Confianza media",
    color: "var(--md-secondary)",
    bg: "var(--md-secondary-container)",
    text: "var(--md-on-secondary-container)",
  },
  low: {
    label: "Pocos datos",
    color: "var(--color-fuel)",
    bg: "var(--color-fuel-container)",
    text: "var(--color-fuel-on-container)",
  },
  none: {
    label: "Sin datos",
    color: "var(--md-on-surface-variant)",
    bg: "var(--md-surface-container-high)",
    text: "var(--md-on-surface-variant)",
  },
};

export default function MaintenancePage() {
  const { services, vehicle, charges, fuelUps } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services
    .filter(
      (s) =>
        s.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCost = services.reduce((sum, s) => sum + s.costPEN, 0);

  const proj = computeServiceProjection(vehicle, charges, fuelUps, services);
  const conf = CONFIDENCE_CONFIG[proj.confidence];

  // Milestones up to 20k beyond current (show relevant upcoming ones)
  const visibleUpTo = Math.max(50_000, vehicle.currentOdometer + 20_000);
  const milestones = getAllServiceMilestones(visibleUpTo);
  // Mark done: a milestone is done if a service exists within ±1500 km of it
  const doneMilestones = new Set(
    milestones.filter((m) =>
      services.some((s) => Math.abs(s.odometer - m) <= 1_500)
    )
  );

  const isUrgent = !proj.isOverdue && proj.kmRemaining <= 1_000;

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
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
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Servicios y proyección
            </p>
          </div>
          <Link href="/maintenance/new">
            <Button
              variant="filled"
              size="sm"
              className="gap-2"
              style={
                {
                  background: "var(--color-service)",
                  color: "white",
                } as React.CSSProperties
              }
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          </Link>
        </div>

        {/* ── Projection card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-[var(--shape-xl)] overflow-hidden"
          style={{ background: "var(--md-surface-container)" }}
        >
          {/* Top strip: next service status */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              background: proj.isOverdue
                ? "var(--md-error-container)"
                : isUrgent
                ? "var(--color-fuel-container)"
                : "var(--color-service-container)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: proj.isOverdue
                  ? "var(--md-error)"
                  : isUrgent
                  ? "var(--color-fuel)"
                  : "var(--color-service)",
              }}
            >
              {proj.isOverdue ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : isUrgent ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold"
                style={{
                  color: proj.isOverdue
                    ? "var(--md-on-error-container)"
                    : isUrgent
                    ? "var(--color-fuel-on-container)"
                    : "var(--color-service-on-container)",
                }}
              >
                {proj.isOverdue
                  ? "Servicio vencido"
                  : `Próximo servicio a los ${formatKm(proj.nextServiceKm)}`}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: proj.isOverdue
                    ? "var(--md-on-error-container)"
                    : isUrgent
                    ? "var(--color-fuel-on-container)"
                    : "var(--color-service-on-container)",
                  opacity: 0.8,
                }}
              >
                {proj.isOverdue
                  ? "Agenda una cita en Derco Center"
                  : `Faltan ${formatKm(proj.kmRemaining)}`}
              </p>
            </div>
            <div
              className="text-right shrink-0"
              style={{
                color: proj.isOverdue
                  ? "var(--md-on-error-container)"
                  : isUrgent
                  ? "var(--color-fuel-on-container)"
                  : "var(--color-service-on-container)",
              }}
            >
              <p className="text-xs opacity-60">Odómetro</p>
              <p className="text-sm font-bold">
                {formatKm(vehicle.currentOdometer)}
              </p>
            </div>
          </div>

          {/* Body: projection */}
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--color-service)" }}
              />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Proyección de fecha
              </span>
            </div>

            {proj.confidence === "none" ? (
              <div
                className="flex items-start gap-3 p-3 rounded-[var(--shape-md)]"
                style={{ background: "var(--md-surface-container-high)" }}
              >
                <Info
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: "var(--md-on-surface-variant)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--md-on-surface)" }}
                  >
                    Sin suficientes datos
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    Registra al menos 2 eventos con odómetro (cargas o
                    combustible) para proyectar la fecha del próximo servicio.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Rate info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--md-primary)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--md-on-surface-variant)" }}
                    >
                      Ritmo actual (EWMA)
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--md-on-surface)" }}
                  >
                    {proj.kmPerDayEwma} km/día
                  </span>
                </div>

                <div
                  className="text-xs"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Basado en {proj.dataPoints} registros ·{" "}
                  {proj.windowDays > 0 ? `${proj.windowDays} días de historial` : "historial limitado"}
                </div>

                {/* Three-scenario timeline */}
                <div
                  className="rounded-[var(--shape-md)] overflow-hidden"
                  style={{ background: "var(--md-surface-container-high)" }}
                >
                  {[
                    {
                      icon: "⚡",
                      label: "Ritmo elevado",
                      date: proj.earlyDate,
                      rate: proj.kmPerDayP75,
                      isMain: false,
                    },
                    {
                      icon: "●",
                      label: "Estimación central",
                      date: proj.expectedDate,
                      rate: proj.kmPerDayEwma,
                      isMain: true,
                    },
                    {
                      icon: "○",
                      label: "Ritmo reducido",
                      date: proj.lateDate,
                      rate: proj.kmPerDayP25,
                      isMain: false,
                    },
                  ].map((scenario, i, arr) => (
                    <div
                      key={scenario.label}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        background: scenario.isMain
                          ? "var(--color-service-container)"
                          : "transparent",
                        borderBottom:
                          i < arr.length - 1
                            ? "1px solid var(--md-outline-variant)"
                            : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-base leading-none"
                          style={{
                            color: scenario.isMain
                              ? "var(--color-service)"
                              : "var(--md-on-surface-variant)",
                          }}
                        >
                          {scenario.icon}
                        </span>
                        <div>
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: scenario.isMain
                                ? "var(--color-service-on-container)"
                                : "var(--md-on-surface-variant)",
                            }}
                          >
                            {scenario.label}
                          </p>
                          {scenario.rate > 0 && (
                            <p
                              className="text-[10px] mt-0.5"
                              style={{
                                color: scenario.isMain
                                  ? "var(--color-service-on-container)"
                                  : "var(--md-on-surface-variant)",
                                opacity: 0.7,
                              }}
                            >
                              ~{scenario.rate} km/día
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: scenario.isMain
                            ? "var(--color-service-on-container)"
                            : "var(--md-on-surface)",
                          fontFamily: "var(--font-display, system-ui)",
                        }}
                      >
                        {scenario.date
                          ? formatProjectionDate(scenario.date)
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Confidence badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--md-on-surface-variant)" }}
                    />
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--md-on-surface-variant)" }}
                    >
                      Ingresá el odómetro en cada carga para mejorar la
                      proyección
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
                    style={{ background: conf.bg, color: conf.text }}
                  >
                    {conf.label}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Servicios",
              value: String(services.length),
              color: "var(--color-service)",
            },
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
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
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
                <Wrench
                  className="w-7 h-7"
                  style={{ color: "var(--color-service)" }}
                />
              </div>
              <p
                className="font-semibold text-base"
                style={{ color: "var(--md-on-surface)" }}
              >
                Sin servicios registrados
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Registra el primer servicio de tu vehículo
              </p>
              <Link href="/maintenance/new" className="mt-5 inline-block">
                <Button
                  variant="filled"
                  className="gap-2"
                  style={
                    {
                      background: "var(--color-service)",
                    } as React.CSSProperties
                  }
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
                    <Link href={`/maintenance/${service.id}/edit`}>
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

        {/* ── Schedule table ── */}
        <div className="card-outlined p-4">
          <h3
            className="font-semibold mb-3 text-sm"
            style={{
              color: "var(--md-on-surface)",
              fontFamily: "var(--font-display, system-ui)",
            }}
          >
            Programa de Mantenimiento
          </h3>
          <div className="space-y-0">
            {milestones.map((km, i) => {
              const isDone = doneMilestones.has(km);
              const isNext = km === proj.nextServiceKm;
              return (
                <div
                  key={km}
                  className="flex items-center gap-3 py-2.5"
                  style={{
                    borderBottom:
                      i < milestones.length - 1
                        ? "1px solid var(--md-outline-variant)"
                        : undefined,
                  }}
                >
                  {/* Status dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: isDone
                        ? "var(--md-tertiary)"
                        : isNext
                        ? "var(--color-service)"
                        : "var(--md-outline-variant)",
                    }}
                  />
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: isDone
                        ? "var(--md-on-surface-variant)"
                        : isNext
                        ? "var(--md-on-surface)"
                        : "var(--md-on-surface-variant)",
                      fontWeight: isNext ? 600 : 400,
                      textDecoration: isDone ? "line-through" : undefined,
                      opacity: isDone ? 0.6 : 1,
                    }}
                  >
                    {formatKm(km)}
                  </span>
                  <div className="flex items-center gap-2">
                    {isNext && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--color-service-container)",
                          color: "var(--color-service-on-container)",
                        }}
                      >
                        próximo
                      </span>
                    )}
                    {isDone && (
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--md-tertiary)" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
