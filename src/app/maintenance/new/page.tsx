"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { SERVICE_TYPES } from "@/types";
import { ArrowLeft, Wrench, Save, Loader2, MapPin, FileText, Gauge } from "lucide-react";
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
    provider: "",
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
      setSubmitError(
        err instanceof Error ? err.message : "Error al guardar el servicio"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    height: "3.5rem",
    padding: "0 1rem",
    borderRadius: "var(--shape-sm)",
    border: "1.5px solid var(--md-outline-variant)",
    background: "transparent",
    color: "var(--md-on-surface)",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      (e.currentTarget.style.borderColor = "var(--md-primary)"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      (e.currentTarget.style.borderColor = "var(--md-outline-variant)"),
  };

  const sectionCard = "rounded-[var(--shape-xl)] p-5 space-y-4";
  const sectionBg = { background: "var(--md-surface-container)" };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-4 pb-6">
        {/* Sticky sub-header */}
        <div
          className="sticky-below-header flex items-center gap-3 py-3"
          style={{ background: "var(--md-surface)" }}
        >
          <Link href="/maintenance">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "var(--md-surface-container)",
                color: "var(--md-on-surface)",
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ color: "var(--md-on-surface)" }}
            >
              Nuevo Servicio
            </h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              Registra un servicio de mantenimiento
            </p>
          </div>
        </div>

        {/* Error */}
        {(submitError || error) && (
          <div
            className="p-4 rounded-[var(--shape-md)] text-sm"
            style={{
              background: "var(--md-error-container, #FFDAD6)",
              color: "var(--md-on-error-container, #410002)",
            }}
          >
            {submitError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Date + Odometer */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Fecha y Odómetro
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  style={inputBase}
                  {...focusHandlers}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Odómetro (km)
                </label>
                <input
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
                  style={inputBase}
                  {...focusHandlers}
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4" style={{ color: "var(--color-service, #6750A4)" }} />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Tipo de Servicio
              </span>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Servicio
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, serviceType: e.target.value }))
                }
                required
                disabled={isSubmitting}
                style={{ ...inputBase, paddingRight: "2.5rem", appearance: "none" }}
                {...focusHandlers}
              >
                <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>
                  Selecciona el tipo de servicio
                </option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type} style={{ color: "var(--md-on-surface)", background: "var(--md-surface-container)" }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {formData.serviceType === "Otro" && (
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Describe el servicio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de filtro de cabina"
                  value={formData.customServiceType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customServiceType: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                  style={inputBase}
                  {...focusHandlers}
                />
              </div>
            )}
          </div>

          {/* Cost */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Costo
              </span>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Total (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.costPEN}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, costPEN: e.target.value }))
                }
                required
                disabled={isSubmitting}
                style={inputBase}
                {...focusHandlers}
              />
            </div>
          </div>

          {/* Provider */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Taller / Proveedor
              </span>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Nombre (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Derco Center Surco"
                value={formData.provider}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    provider: e.target.value,
                  }))
                }
                disabled={isSubmitting}
                style={inputBase}
                {...focusHandlers}
              />
            </div>
          </div>

          {/* Notes */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Notas
              </span>
            </div>
            <input
              type="text"
              placeholder="Notas adicionales (opcional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isSubmitting}
              style={inputBase}
              {...focusHandlers}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Link href="/maintenance" className="flex-1">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full text-sm font-semibold border transition-all active:scale-95"
                style={{
                  borderColor: "var(--md-outline)",
                  color: "var(--md-on-surface)",
                  background: "transparent",
                }}
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !formData.serviceType}
              className="flex-1 h-12 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
              }}
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
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
