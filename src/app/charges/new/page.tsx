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
import { ArrowLeft, Zap, Save } from "lucide-react";
import Link from "next/link";

export default function NewChargePage() {
  const router = useRouter();
  const { addCharge, vehicle, settings } = useStore();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    location: "home",
    customLocation: "",
    chargeType: "AC_7kW" as Charge["chargeType"],
    odometerStart: vehicle.currentOdometer.toString(),
    odometerEnd: "",
    kwhCharged: "27.28",
    costPEN: "",
    durationMinutes: "",
    notes: "",
  });

  const calculateCost = (kwh: number) => {
    return (kwh * settings.electricityRateKwh).toFixed(2);
  };

  const handleKwhChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      kwhCharged: value,
      costPEN:
        prev.location === "home" ? calculateCost(parseFloat(value) || 0) : "0",
    }));
  };

  const handleLocationChange = (value: string) => {
    const isFree = value !== "home";
    setFormData((prev) => ({
      ...prev,
      location: value,
      costPEN: isFree ? "0" : calculateCost(parseFloat(prev.kwhCharged) || 0),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const locationName =
      formData.location === "other"
        ? formData.customLocation
        : CHARGE_LOCATIONS[formData.location as keyof typeof CHARGE_LOCATIONS];

    addCharge({
      vehicleId: vehicle.id,
      date: `${formData.date}T${formData.time}:00`,
      location: locationName,
      chargeType: formData.chargeType,
      odometerStart: formData.odometerStart
        ? parseInt(formData.odometerStart)
        : undefined,
      odometerEnd: formData.odometerEnd
        ? parseInt(formData.odometerEnd)
        : undefined,
      kwhCharged: parseFloat(formData.kwhCharged) || 0,
      costPEN: parseFloat(formData.costPEN) || 0,
      durationMinutes: formData.durationMinutes
        ? parseInt(formData.durationMinutes)
        : undefined,
      notes: formData.notes || undefined,
    });

    router.push("/charges");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/charges">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nueva Carga</h1>
            <p className="text-[var(--muted-foreground)]">
              Registra una carga electrica
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--deepal-cyan)]" />
              Fecha y Hora
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Ubicacion</h3>
            <RadioGroup
              value={formData.location}
              onValueChange={handleLocationChange}
              className="space-y-3"
            >
              {Object.entries(CHARGE_LOCATIONS).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="cursor-pointer">
                    {label}
                    {key !== "home" && key !== "other" && (
                      <span className="ml-2 text-xs text-[var(--deepal-teal)]">
                        (Gratis)
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {formData.location === "other" && (
              <Input
                placeholder="Nombre de la ubicacion"
                value={formData.customLocation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customLocation: e.target.value,
                  }))
                }
                className="mt-3"
                required={formData.location === "other"}
              />
            )}
          </GlassCard>

          {/* Charge Type */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Tipo de Carga</h3>
            <RadioGroup
              value={formData.chargeType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  chargeType: value as Charge["chargeType"],
                }))
              }
              className="space-y-3"
            >
              {Object.entries(CHARGE_TYPES).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3">
                  <RadioGroupItem value={key} id={`type-${key}`} />
                  <Label htmlFor={`type-${key}`} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </GlassCard>

          {/* Charge Details */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Detalles de la Carga</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kwhCharged">kWh Cargados</Label>
                <Input
                  id="kwhCharged"
                  type="number"
                  step="0.01"
                  min="0"
                  max="30"
                  value={formData.kwhCharged}
                  onChange={(e) => handleKwhChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPEN">Costo (S/)</Label>
                <Input
                  id="costPEN"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPEN}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, costPEN: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duracion (min)</Label>
                <Input
                  id="durationMinutes"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometerEnd">Odometro (km)</Label>
                <Input
                  id="odometerEnd"
                  type="number"
                  min="0"
                  value={formData.odometerEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      odometerEnd: e.target.value,
                    }))
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Notas</h3>
            <Input
              placeholder="Notas adicionales (opcional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </GlassCard>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/charges" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="cyan" className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Guardar Carga
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
