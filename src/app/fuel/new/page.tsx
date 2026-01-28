"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Fuel, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewFuelPage() {
  const router = useRouter();
  const { addFuelUpAsync, vehicle, isLoading, error } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    odometer: vehicle.currentOdometer.toString(),
    liters: "",
    costPEN: "",
    costPerLiter: "",
    location: "",
    notes: "",
  });

  const handleLitersChange = (value: string) => {
    setFormData((prev) => {
      const liters = parseFloat(value) || 0;
      const costPEN = parseFloat(prev.costPEN) || 0;
      const costPerLiter = liters > 0 ? (costPEN / liters).toFixed(2) : "";
      return { ...prev, liters: value, costPerLiter };
    });
  };

  const handleCostChange = (value: string) => {
    setFormData((prev) => {
      const liters = parseFloat(prev.liters) || 0;
      const costPEN = parseFloat(value) || 0;
      const costPerLiter = liters > 0 ? (costPEN / liters).toFixed(2) : "";
      return { ...prev, costPEN: value, costPerLiter };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addFuelUpAsync({
        date: `${formData.date}T${formData.time}:00`,
        odometer: parseInt(formData.odometer) || 0,
        liters: parseFloat(formData.liters) || 0,
        costPEN: parseFloat(formData.costPEN) || 0,
        costPerLiter: parseFloat(formData.costPerLiter) || 0,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      router.push("/fuel");
    } catch (err) {
      console.error("Error saving fuel up:", err);
      setSubmitError(err instanceof Error ? err.message : "Error al guardar el combustible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fuel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nueva Carga de Combustible</h1>
            <p className="text-[var(--muted-foreground)]">
              Registra una carga de gasolina
            </p>
          </div>
        </div>

        {/* Error Message */}
        {(submitError || error) && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {submitError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[var(--deepal-warning)]" />
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Ubicación</h3>
            <div className="space-y-2">
              <Label htmlFor="location">Gasolinera (opcional)</Label>
              <Input
                id="location"
                placeholder="Ej: Primax, Repsol, Pecsa..."
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </GlassCard>

          {/* Fuel Details */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Detalles de la Carga</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odometer">Odómetro (km)</Label>
                <Input
                  id="odometer"
                  type="number"
                  min="0"
                  value={formData.odometer}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      odometer: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liters">Litros</Label>
                <Input
                  id="liters"
                  type="number"
                  step="0.01"
                  min="0"
                  max="51"
                  value={formData.liters}
                  onChange={(e) => handleLitersChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPEN">Costo Total (S/)</Label>
                <Input
                  id="costPEN"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPEN}
                  onChange={(e) => handleCostChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerLiter">Precio/Litro (S/)</Label>
                <Input
                  id="costPerLiter"
                  type="number"
                  step="0.01"
                  value={formData.costPerLiter}
                  readOnly
                  className="bg-[var(--muted)]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Notas</h3>
            <Input
              placeholder="Ej: Viaje a Paracas, emergencia..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </GlassCard>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/fuel" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="cyan"
              className="flex-1 gap-2"
              disabled={isSubmitting || isLoading}
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
