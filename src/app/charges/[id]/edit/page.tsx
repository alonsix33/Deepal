"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/store/useStore";
import { CHARGE_TYPES, CHARGE_LOCATIONS, type Charge } from "@/types";
import {
  ArrowLeft, Zap, Save, Loader2, Trash2,
  ParkingCircle, DollarSign, BatteryFull, Plug, Flame,
} from "lucide-react";
import Link from "next/link";
import { SliderRow } from "@/components/ui/slider-row";
import { BatteryBar } from "@/components/ui/battery-bar";
import { todayLocalISO } from "@/lib/utils";

function resolveLocation(location: string): { locationKey: string; customLocation: string } {
  if (location in CHARGE_LOCATIONS) return { locationKey: location, customLocation: "" };
  const entry = Object.entries(CHARGE_LOCATIONS).find(([, v]) => v === location);
  if (entry) return { locationKey: entry[0], customLocation: "" };
  return { locationKey: "other", customLocation: location };
}

export default function EditChargePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { charges, settings, vehicle, updateChargeAsync, deleteChargeAsync } = useStore();
  const charge = charges.find((c) => c.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const batteryCapacity = settings.batteryCapacity || 27.28;
  const efficiency = settings.chargingEfficiency || 0.9;
  const rateKwh = settings.electricityRateKwh || 0.6861;

  useEffect(() => {
    if (charges.length > 0 && !charge) router.replace("/charges");
  }, [charge, charges.length, router]);

  const { locationKey: initLocationKey, customLocation: initCustomLocation } = charge
    ? resolveLocation(charge.location)
    : { locationKey: "home", customLocation: "" };

  const [formData, setFormData] = useState({
    date: charge ? charge.date : todayLocalISO(),
    location: initLocationKey,
    customLocation: initCustomLocation,
    chargeType: (charge?.chargeType ?? "AC_7kW") as Charge["chargeType"],
    batteryStartPercent: String(charge?.batteryStartPercent ?? 0),
    batteryEndPercent: String(charge?.batteryEndPercent ?? 100),
    isFree: charge?.isFree ?? false,
    parkingCostPEN: String(charge?.parkingCostPEN ?? 0),
    kwhRate: String(charge?.kwhRate ?? rateKwh),
    odometerEnd: charge?.odometerEnd ? String(charge.odometerEnd) : "",
    durationMinutes: charge?.durationMinutes ? String(charge.durationMinutes) : "",
    notes: charge?.notes ?? "",
  });

  const startPercent = Math.min(100, Math.max(0, parseFloat(formData.batteryStartPercent) || 0));
  const endPercent   = Math.min(100, Math.max(0, parseFloat(formData.batteryEndPercent)   || 0));
  const kwhNet  = endPercent > startPercent ? ((endPercent - startPercent) / 100) * batteryCapacity : 0;
  const kwhGrid = kwhNet / efficiency;

  const isHome = formData.location === "home";
  const isDC   = formData.chargeType === "DC_50kW";

  const electricityCost = isDC
    ? kwhGrid * (parseFloat(formData.kwhRate) || rateKwh)
    : kwhGrid * rateKwh;
  const parkingCost = isHome ? 0 : (parseFloat(formData.parkingCostPEN) || 0);
  const totalCost   = formData.isFree ? parkingCost : electricityCost + parkingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const locationName =
      formData.location === "other"
        ? formData.customLocation
        : CHARGE_LOCATIONS[formData.location as keyof typeof CHARGE_LOCATIONS];

    const finalKwh = kwhNet > 0 ? Math.round(kwhNet * 100) / 100 : (charge?.kwhCharged ?? 0);

    try {
      await updateChargeAsync(id, {
        date: `${formData.date}T12:00:00`,
        location: locationName,
        chargeType: formData.chargeType,
        batteryStartPercent: startPercent,
        batteryEndPercent: endPercent,
        kwhCharged: finalKwh,
        isFree: formData.isFree,
        parkingCostPEN: parkingCost,
        totalCost: Math.round(totalCost * 100) / 100,
        kwhRate: isDC ? (parseFloat(formData.kwhRate) || undefined) : undefined,
        odometerEnd: formData.odometerEnd ? parseInt(formData.odometerEnd) : undefined,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
        notes: formData.notes || undefined,
      });
      router.push("/charges");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteChargeAsync(id);
      router.push("/charges");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al eliminar");
      setIsDeleting(false);
    }
  };

  if (!charge) return null;

  return (
    <AppLayout>
      <div className="space-y-4 pb-8">
        {/* Sticky sub-header */}
        <div className="flex items-center gap-3 sticky-below-header bg-[var(--md-surface)]/92 backdrop-blur-lg py-3 -mx-4 px-4 border-b border-[var(--md-outline-variant)]">
          <Link href="/charges">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight" style={{ color: "var(--md-on-surface)" }}>
              Editar Carga
            </h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              {charge.location}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px]" style={{ color: "var(--md-on-surface-variant)" }}>Tarifa</div>
            <div className="text-sm font-semibold" style={{ color: "var(--md-primary)" }}>
              S/ {rateKwh}/kWh
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-[var(--shape-md)] text-sm"
            style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Batería ── */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <BatteryFull className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--md-on-surface)" }}>
                Batería
              </h3>
            </div>
            <BatteryBar startPercent={startPercent} endPercent={endPercent} />
            <div className="space-y-4">
              <SliderRow
                label="% Inicio" value={startPercent} min={0} max={100}
                disabled={isSubmitting || isDeleting}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    batteryStartPercent: v,
                    batteryEndPercent: Math.max(parseInt(v) || 0, parseInt(prev.batteryEndPercent) || 0).toString(),
                  }))
                }
                onInputChange={(v) => {
                  const n = Math.min(100, Math.max(0, parseInt(v) || 0));
                  setFormData((prev) => ({
                    ...prev,
                    batteryStartPercent: n.toString(),
                    batteryEndPercent: Math.max(n, parseInt(prev.batteryEndPercent) || 0).toString(),
                  }));
                }}
              />
              <SliderRow
                label="% Fin" value={endPercent} min={startPercent} max={100}
                disabled={isSubmitting || isDeleting}
                onChange={(v) => setFormData((prev) => ({ ...prev, batteryEndPercent: v }))}
                onInputChange={(v) => {
                  const n = Math.min(100, Math.max(startPercent, parseInt(v) || 0));
                  setFormData((prev) => ({ ...prev, batteryEndPercent: n.toString() }));
                }}
              />
            </div>
          </GlassCard>

          {/* ── Vista previa del costo ── */}
          <GlassCard>
            <h3 className="type-label-sm mb-3" style={{ color: "var(--md-on-surface-variant)" }}>
              Vista Previa del Costo
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "kWh Netos", value: (kwhNet > 0 ? kwhNet : charge.kwhCharged).toFixed(2), color: "var(--md-on-surface)" },
                { label: "kWh Red",   value: (kwhNet > 0 ? kwhGrid : charge.kwhCharged / efficiency).toFixed(2), color: "var(--md-tertiary)" },
                { label: "Costo Est.", value: `S/ ${totalCost.toFixed(2)}`, color: "var(--md-primary)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-3 rounded-[var(--shape-md)]"
                  style={{ background: "var(--md-surface-container-high)" }}
                >
                  <div className="text-[10px] mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                    {item.label}
                  </div>
                  <div className="text-base font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {formData.isFree && (
              <p className="mt-2 text-center text-xs" style={{ color: "var(--md-tertiary)" }}>
                Carga gratis — solo aplica estacionamiento
              </p>
            )}
          </GlassCard>

          {/* ── Fecha ── */}
          <GlassCard>
            <Label className="text-xs mb-2 block" style={{ color: "var(--md-on-surface-variant)" }}>
              Fecha
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full min-w-0 max-w-full"
              required
              disabled={isSubmitting}
            />
          </GlassCard>

          {/* ── Ubicación ── */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--md-on-surface)" }}>
                Ubicación
              </h3>
            </div>
            <RadioGroup
              value={formData.location}
              onValueChange={(value) => setFormData((prev) => ({
                ...prev,
                location: value,
                isFree: value === "home" ? false : prev.isFree,
                parkingCostPEN: value === "home" ? "0" : prev.parkingCostPEN,
              }))}
              className="grid grid-cols-2 gap-2"
              disabled={isSubmitting}
            >
              {Object.entries(CHARGE_LOCATIONS).map(([key, label]) => {
                const isSelected = formData.location === key;
                return (
                  <div
                    key={key}
                    className="p-3 rounded-[var(--shape-md)] border cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? "var(--md-primary)" : "var(--md-outline-variant)",
                      background: isSelected ? "var(--md-primary-container)" : "transparent",
                    }}
                  >
                    <RadioGroupItem value={key} id={`loc-${key}`} className="sr-only" />
                    <Label htmlFor={`loc-${key}`} className="cursor-pointer block">
                      <span
                        className="text-sm font-medium block"
                        style={{ color: isSelected ? "var(--md-on-primary-container)" : "var(--md-on-surface)" }}
                      >
                        {label}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            {formData.location === "other" && (
              <Input
                placeholder="Nombre del lugar"
                value={formData.customLocation}
                onChange={(e) => setFormData((prev) => ({ ...prev, customLocation: e.target.value }))}
                className="mt-2"
                required
                disabled={isSubmitting}
              />
            )}
          </GlassCard>

          {/* ── Tipo de Carga ── */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--md-on-surface)" }}>
                Tipo de Carga
              </h3>
            </div>
            <RadioGroup
              value={formData.chargeType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, chargeType: value as Charge["chargeType"] }))}
              className="grid grid-cols-3 gap-2"
              disabled={isSubmitting}
            >
              {Object.entries(CHARGE_TYPES).map(([key, label]) => {
                const isSelected = formData.chargeType === key;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-center py-2.5 px-1 rounded-[var(--shape-md)] border cursor-pointer transition-all text-center"
                    style={{
                      borderColor: isSelected ? "var(--md-primary)" : "var(--md-outline-variant)",
                      background: isSelected ? "var(--md-primary-container)" : "transparent",
                    }}
                  >
                    <RadioGroupItem value={key} id={`type-${key}`} className="sr-only" />
                    <Label
                      htmlFor={`type-${key}`}
                      className="cursor-pointer text-xs leading-tight"
                      style={{ color: isSelected ? "var(--md-on-primary-container)" : "var(--md-on-surface)" }}
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </GlassCard>

          {/* ── Costo ── */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--md-on-surface)" }}>
                Costo
              </h3>
            </div>
            <div className="space-y-3">
              {!isHome && (
                <label
                  className="flex items-center gap-3 p-3 rounded-[var(--shape-md)] border cursor-pointer transition-all"
                  style={{
                    borderColor: formData.isFree ? "var(--md-primary)" : "var(--md-outline-variant)",
                    background: formData.isFree ? "var(--md-primary-container)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFree: e.target.checked }))}
                    style={{ accentColor: "var(--md-primary)" }}
                    disabled={isSubmitting}
                  />
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: formData.isFree ? "var(--md-on-primary-container)" : "var(--md-on-surface)" }}
                    >
                      Carga gratis
                    </span>
                    <p
                      className="text-xs"
                      style={{ color: formData.isFree ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)", opacity: 0.75 }}
                    >
                      Solo se contabiliza el estacionamiento
                    </p>
                  </div>
                </label>
              )}
              {isDC && !formData.isFree && (
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                    Precio por kWh (S/)
                  </Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={formData.kwhRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kwhRate: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
              )}
              {!isHome && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <ParkingCircle className="w-3.5 h-3.5" style={{ color: "var(--md-on-surface-variant)" }} />
                    <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                      Estacionamiento (S/)
                    </Label>
                  </div>
                  <Input
                    type="number" step="0.5" min="0"
                    value={formData.parkingCostPEN}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parkingCostPEN: e.target.value }))}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              {isHome && (
                <p className="text-xs py-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  Carga en casa — el costo se calcula con tu tarifa de electricidad (S/ {rateKwh}/kWh).
                </p>
              )}
            </div>
          </GlassCard>

          {/* ── Odómetro & Duración ── */}
          <GlassCard>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  Odómetro final (km)
                </Label>
                <Input
                  type="number" min="0"
                  value={formData.odometerEnd}
                  onChange={(e) => setFormData((prev) => ({ ...prev, odometerEnd: e.target.value }))}
                  placeholder={vehicle.currentOdometer.toString()}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  Duración (min)
                </Label>
                <Input
                  type="number" min="0"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                  placeholder="Opcional"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </GlassCard>

          {/* ── Notas ── */}
          <GlassCard>
            <Label className="text-xs mb-2 block" style={{ color: "var(--md-on-surface-variant)" }}>
              Notas (opcional)
            </Label>
            <Input
              placeholder="Notas adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isSubmitting}
            />
          </GlassCard>

          {/* ── Botones ── */}
          <div
            className="flex gap-3 sticky bottom-0 pb-4 pt-2 -mx-4 px-4 border-t"
            style={{
              background: "color-mix(in srgb, var(--md-surface) 92%, transparent)",
              backdropFilter: "blur(12px)",
              borderColor: "var(--md-outline-variant)",
            }}
          >
            <Button
              type="button"
              variant="outlined"
              className="flex-1 gap-2"
              style={{ borderColor: "var(--md-error)", color: "var(--md-error)" } as React.CSSProperties}
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Eliminando...</>
              ) : (
                <><Trash2 className="w-4 h-4" />Eliminar</>
              )}
            </Button>
            <Button
              type="submit"
              variant="filled"
              className="flex-1 gap-2"
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              ) : (
                <><Save className="w-4 h-4" />Guardar cambios</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
