"use client";

import React, { useState, useMemo } from "react";
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
  ArrowLeft,
  Zap,
  Save,
  Loader2,
  ParkingCircle,
  DollarSign,
  BatteryFull,
  Plug,
  Flame,
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
    time: new Date().toTimeString().slice(0, 5),
    location: "home",
    customLocation: "",
    chargeType: "AC_7kW" as Charge["chargeType"],
    batteryStartPercent: "0",
    batteryEndPercent: "100",
    isFree: false,
    parkingCostPEN: "0",
    kwhRate: rateKwh.toString(),
    odometerStart: vehicle.currentOdometer.toString(),
    odometerEnd: "",
    durationMinutes: "",
    notes: "",
  });

  const startPercent = Math.min(100, Math.max(0, parseFloat(formData.batteryStartPercent) || 0));
  const endPercent = Math.min(100, Math.max(0, parseFloat(formData.batteryEndPercent) || 0));
  const kwhNet = endPercent > startPercent
    ? ((endPercent - startPercent) / 100) * batteryCapacity
    : 0;
  const kwhGrid = kwhNet / efficiency;

  const isMall = formData.location !== "home" && formData.location !== "other";
  const isDC = formData.chargeType === "DC_50kW";

  const electricityCost = isDC
    ? kwhGrid * (parseFloat(formData.kwhRate) || rateKwh)
    : kwhGrid * rateKwh;
  const parkingCost = parseFloat(formData.parkingCostPEN) || 0;
  const totalCost = formData.isFree ? parkingCost : electricityCost + parkingCost;

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
        date: `${formData.date}T${formData.time}:00`,
        location: locationName,
        chargeType: formData.chargeType,
        batteryStartPercent: startPercent,
        batteryEndPercent: endPercent,
        kwhCharged: Math.round(kwhNet * 100) / 100,
        isFree: formData.isFree,
        parkingCostPEN: parkingCost,
        totalCost: Math.round(totalCost * 100) / 100,
        kwhRate: isDC ? parseFloat(formData.kwhRate) || undefined : undefined,
        odometerStart: formData.odometerStart
          ? parseInt(formData.odometerStart)
          : undefined,
        odometerEnd: formData.odometerEnd
          ? parseInt(formData.odometerEnd)
          : undefined,
        durationMinutes: formData.durationMinutes
          ? parseInt(formData.durationMinutes)
          : undefined,
        notes: formData.notes || undefined,
      });

      router.push("/charges");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error al guardar la carga"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const batteryBarSections = [
    { label: "Inicio", percent: startPercent, color: "bg-[var(--muted)]" },
    { label: "Fin", percent: endPercent, color: "bg-[var(--deepal-cyan)]" },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 sticky-below-header bg-[var(--md-surface)]/90 backdrop-blur-lg py-3 -mx-4 px-4 border-b border-[var(--md-outline-variant)]">
          <Link href="/charges">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Nueva Carga</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Registra una carga eléctrica
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--muted-foreground)]">Tarifa</div>
            <div className="text-sm font-semibold text-[var(--deepal-cyan)]">
              S/ {rateKwh}/kWh
            </div>
          </div>
        </div>

        {(submitError) && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Battery Preview Card */}
          <GlassCard className="overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <BatteryFull className="w-5 h-5 text-[var(--deepal-cyan)]" />
              <h3 className="font-semibold">Batería</h3>
            </div>

            {/* Battery visual bar */}
            <div className="relative h-16 bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] mb-4">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--deepal-cyan)]/30 to-[var(--deepal-cyan)] transition-all duration-300"
                style={{ width: `${endPercent}%` }}
              />
              <div
                className="absolute inset-y-0 bg-[var(--muted)]/80 transition-all duration-300"
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-xs font-mono font-bold">{startPercent}%</span>
                <span className="text-xs font-mono font-bold">{endPercent}%</span>
              </div>
            </div>

            {/* Battery sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">% Inicio</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.batteryStartPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        batteryStartPercent: e.target.value,
                        batteryEndPercent: Math.max(
                          parseInt(e.target.value),
                          parseInt(prev.batteryEndPercent)
                        ).toString(),
                      }))
                    }
                    className="flex-1 h-1.5 accent-[var(--deepal-cyan)]"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.batteryStartPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        batteryStartPercent: e.target.value,
                      }))
                    }
                    className="w-16 text-center text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">% Fin</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={formData.batteryStartPercent}
                    max="100"
                    step="5"
                    value={formData.batteryEndPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        batteryEndPercent: e.target.value,
                      }))
                    }
                    className="flex-1 h-1.5 accent-[var(--deepal-cyan)]"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="number"
                    min={formData.batteryStartPercent}
                    max="100"
                    step="5"
                    value={formData.batteryEndPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        batteryEndPercent: e.target.value,
                      }))
                    }
                    className="w-16 text-center text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Instant Preview */}
          <GlassCard>
            <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
              Vista Previa del Costo
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[var(--card)]">
                <div className="text-xs text-[var(--muted-foreground)]">kWh Netos</div>
                <div className="text-lg font-bold text-white">{kwhNet.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--card)]">
                <div className="text-xs text-[var(--muted-foreground)]">kWh Red</div>
                <div className="text-lg font-bold text-[var(--deepal-teal)]">
                  {kwhGrid.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--card)]">
                <div className="text-xs text-[var(--muted-foreground)]">Costo Est.</div>
                <div className="text-lg font-bold text-[var(--deepal-cyan)]">
                  S/ {totalCost.toFixed(2)}
                </div>
              </div>
            </div>
            {formData.isFree && (
              <div className="mt-2 text-center text-xs text-[var(--deepal-teal)]">
                Carga gratis — solo aplica estacionamiento
              </div>
            )}
            <div className="mt-1 text-center text-xs text-[var(--muted-foreground)]">
              Eficiencia: {Math.round(efficiency * 100)}% | {(kwhNet > 0 ? (kwhGrid - kwhNet) : 0).toFixed(2)} kWh en pérdidas
            </div>
          </GlassCard>

          {/* Date & Time */}
          <GlassCard>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  className="text-sm"
                />
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-4 h-4 text-[var(--deepal-cyan)]" />
              <h3 className="font-semibold text-sm">Ubicación</h3>
            </div>
            <RadioGroup
              value={formData.location}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  location: value,
                }))
              }
              className="grid grid-cols-2 gap-2"
              disabled={isSubmitting}
            >
              {Object.entries(CHARGE_LOCATIONS).map(([key, label]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    formData.location === key
                      ? "border-[var(--deepal-cyan)] bg-[var(--deepal-cyan)]/10"
                      : "border-[var(--border)]"
                  }`}
                >
                  <RadioGroupItem value={key} id={key} className="sr-only" />
                  <Label htmlFor={key} className="cursor-pointer text-xs flex-1">
                    {label}
                    {key !== "home" && key !== "other" && (
                      <span className="block text-[10px] text-[var(--deepal-teal)]">
                        Gratis
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {formData.location === "other" && (
              <Input
                placeholder="Nombre del lugar"
                value={formData.customLocation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customLocation: e.target.value,
                  }))
                }
                className="mt-2 text-sm"
                required
                disabled={isSubmitting}
              />
            )}
          </GlassCard>

          {/* Charge Type */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-[var(--deepal-cyan)]" />
              <h3 className="font-semibold text-sm">Tipo de Carga</h3>
            </div>
            <RadioGroup
              value={formData.chargeType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  chargeType: value as Charge["chargeType"],
                }))
              }
              className="grid grid-cols-3 gap-2"
              disabled={isSubmitting}
            >
              {Object.entries(CHARGE_TYPES).map(([key, label]) => (
                <div
                  key={key}
                  className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${
                    formData.chargeType === key
                      ? "border-[var(--deepal-cyan)] bg-[var(--deepal-cyan)]/10"
                      : "border-[var(--border)]"
                  }`}
                >
                  <RadioGroupItem value={key} id={`type-${key}`} className="sr-only" />
                  <Label
                    htmlFor={`type-${key}`}
                    className="cursor-pointer text-xs text-center"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </GlassCard>

          {/* Cost & Parking */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[var(--deepal-cyan)]" />
              <h3 className="font-semibold text-sm">Costo</h3>
            </div>
            <div className="space-y-3">
              {isMall && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFree: e.target.checked,
                      }))
                    }
                    className="accent-[var(--deepal-cyan)]"
                    disabled={isSubmitting}
                  />
                  <div>
                    <span className="text-sm font-medium">Carga gratis</span>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      La carga es gratuita en este local
                    </p>
                  </div>
                </label>
              )}

              {isDC && (
                <div className="space-y-1">
                  <Label className="text-xs">Precio por kWh (S/)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.kwhRate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        kwhRate: e.target.value,
                      }))
                    }
                    className="text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <ParkingCircle className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Estacionamiento (S/)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.parkingCostPEN}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parkingCostPEN: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Odometer & Duration */}
          <GlassCard>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Odómetro Final (km)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.odometerEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      odometerEnd: e.target.value,
                    }))
                  }
                  placeholder={vehicle.currentOdometer.toString()}
                  className="text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duración (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationMinutes: e.target.value,
                    }))
                  }
                  placeholder="Opcional"
                  className="text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard>
            <Label className="text-xs mb-1 block">Notas</Label>
            <Input
              placeholder="Notas adicionales..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isSubmitting}
              className="text-sm"
            />
          </GlassCard>

          {/* Submit */}
          <div className="flex gap-3 sticky bottom-0 pb-4 pt-2 bg-[var(--md-surface)]/90 backdrop-blur-lg -mx-4 px-4 border-t border-[var(--md-outline-variant)]">
            <Link href="/charges" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="cyan"
              className="flex-1 gap-2"
              disabled={isSubmitting || kwhNet <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
