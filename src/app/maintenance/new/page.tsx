"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { SERVICE_TYPES } from "@/types";
import { ArrowLeft, Wrench, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewMaintenancePage() {
  const router = useRouter();
  const { addServiceAsync, vehicle, isLoading, error } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    odometer: vehicle.currentOdometer.toString(),
    serviceType: "",
    customServiceType: "",
    costPEN: "",
    provider: "Derco Center Surco",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const serviceType =
      formData.serviceType === "Otro"
        ? formData.customServiceType
        : formData.serviceType;

    try {
      await addServiceAsync({
        date: formData.date,
        odometer: parseInt(formData.odometer) || 0,
        serviceType,
        costPEN: parseFloat(formData.costPEN) || 0,
        provider: formData.provider || undefined,
        notes: formData.notes || undefined,
      });

      router.push("/maintenance");
    } catch (err) {
      console.error("Error saving service:", err);
      setSubmitError(err instanceof Error ? err.message : "Error al guardar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/maintenance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nuevo Servicio</h1>
            <p className="text-[var(--muted-foreground)]">
              Registra un servicio de mantenimiento
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
          {/* Date */}
          <GlassCard>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[var(--deepal-blue)]" />
              Fecha del Servicio
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
            </div>
          </GlassCard>

          {/* Service Type */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Tipo de Servicio</h3>
            <div className="space-y-4">
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, serviceType: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.serviceType === "Otro" && (
                <Input
                  placeholder="Describe el servicio"
                  value={formData.customServiceType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customServiceType: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                />
              )}
            </div>
          </GlassCard>

          {/* Cost and Provider */}
          <GlassCard>
            <h3 className="font-semibold mb-4">Detalles</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      provider: e.target.value,
                    }))
                  }
                  placeholder="Ej: Derco Center"
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </GlassCard>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/maintenance" className="flex-1">
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
                  Guardar Servicio
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
