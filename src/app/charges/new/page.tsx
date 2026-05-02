"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/store/useStore";
import { CHARGE_TYPES, CHARGE_LOCATIONS, type Charge } from "@/types";
import {
  ArrowLeft, Zap, Save, Loader2,
  ParkingCircle, DollarSign, BatteryFull, Plug, Flame,
} from "lucide-react";
import Link from "next/link";

export default function NewChargePage() {
  const router = useRouter();
  const { addChargeAsync, vehicle, settings } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const batteryCapacity = settings.batteryCapacity || 27.28;
  const efficiency = settings.chargingEfficiency || 0.9;
  const rateKwh = settings.electricityRateKwh || 0.6861;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    location: "home",
    customLocation: "",
    chargeType: "AC_7kW" as Charge["chargeType"],
    batteryStartPercent: "0",
    batteryEndPercent: "100",
    isFree: false,
    parkingCostPEN: "0",
    kwhRate: rateKwh.toString(),
    odometerEnd: "",
    durationMinutes: "",
    notes: "",
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

    try {
      await addChargeAsync({
        date: `${formData.date}T${new Date().toTimeString().slice(0, 5)}:00`,
        location: locationName,
        chargeType: formData.chargeType,
        batteryStartPercent: startPercent,
        batteryEndPercent: endPercent,
        kwhCharged: Math.round(kwhNet * 100) / 100,
        isFree: formData.isFree,
        parkingCostPEN: parkingCost,
        totalCost: Math.round(totalCost * 100) / 100,
        kwhRate: isDC ? parseFloat(formData.kwhRate) || undefined : undefined,
        odometerEnd: formData.odometerEnd ? parseInt(formData.odometerEnd) : undefined,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
        notes: formData.notes || undefined,
      });
      router.push("/charges");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar la carga");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared slider row component
  const SliderRow = ({
    label, value, min, max,
    onChange, onInputChange,
  }: {
    label: string; value: number; min: number; max: number;
    onChange: (v: string) => void; onInputChange: (v: string) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          {label}
        </Label>
        <Input
          type="number"
          min={min}
          max={max}
          step={5}
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isSubmitting}
          className="w-16 h-8 text-center text-sm font-bold p-1"
          style={{ border: "1.5px solid var(--md-primary)" }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isSubmitting}
        className="w-full"
        style={{ accentColor: "var(--md-primary)" }}
      />
    </div>
  );

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
              Nueva Carga
            </h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              Registra una carga eléctrica
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

            {/* Visual bar */}
            <div
              className="relative h-12 rounded-[var(--shape-md)] overflow-hidden mb-4"
              style={{ background: "var(--md-surface-container-high)" }}
            >
              {/* Full end-percent fill */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-300"
                style={{
                  width: `${endPercent}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--md-primary) 30%, transparent), var(--md-primary))`,
                }}
              />
              {/* Start-to-end charged segment */}
              <div
                className="absolute inset-y-0 transition-all duration-300"
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(0, endPercent - startPercent)}%`,
                  background: "var(--md-primary)",
                  opacity: 0.9,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span
                  className="text-xs font-bold"
                  style={{ color: startPercent > 15 ? "var(--md-on-primary)" : "var(--md-on-surface)" }}
                >
                  {startPercent}%
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: endPercent > 50 ? "var(--md-on-primary)" : "var(--md-on-surface)" }}
                >
                  {endPercent}%
                </span>
              </div>
            </div>

            {/* Sliders — one per row, full width */}
            <div className="space-y-4">
              <SliderRow
                label="% Inicio"
                value={startPercent}
                min={0}
                max={100}
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
                label="% Fin"
                value={endPercent}
                min={startPercent}
                max={100}
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
                { label: "kWh Netos", value: kwhNet.toFixed(2), color: "var(--md-on-surface)" },
                { label: "kWh Red",   value: kwhGrid.toFixed(2), color: "var(--md-tertiary)" },
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
            <p className="mt-1 text-center text-[10px]" style={{ color: "var(--md-on-surface-variant)" }}>
              Eficiencia {Math.round(efficiency * 100)}% · {(kwhNet > 0 ? kwhGrid - kwhNet : 0).toFixed(2)} kWh en pérdidas
            </p>
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
                    <RadioGroupItem value={key} id={key} className="sr-only" />
                    <Label htmlFor={key} className="cursor-pointer block">
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
            <Link href="/charges" className="flex-1">
              <Button variant="outlined" className="w-full" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="filled"
              className="flex-1 gap-2"
              disabled={isSubmitting || kwhNet <= 0}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              ) : (
                <><Save className="w-4 h-4" />Guardar</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
