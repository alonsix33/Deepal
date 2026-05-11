"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { todayLocalISO } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { SERVICE_TYPES } from "@/types";
import { ArrowLeft, Wrench, Save, Loader2, Trash2, MapPin, FileText, Gauge } from "lucide-react";
import Link from "next/link";

export default function EditMaintenancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { services, updateServiceAsync, deleteServiceAsync } = useStore();
  const service = services.find((s) => s.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Determine if stored serviceType is a known type or custom
  const knownType = service ? SERVICE_TYPES.includes(service.serviceType) : false;

  const [formData, setFormData] = useState({
    date: service ? service.date : todayLocalISO(),
    odometer: String(service?.odometer ?? 0),
    serviceType: service ? (knownType ? service.serviceType : "Otro") : "",
    customServiceType: service && !knownType ? service.serviceType : "",
    costPEN: service ? String(service.costPEN) : "",
    provider: service?.provider ?? "",
    notes: service?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const serviceType =
      formData.serviceType === "Otro" ? formData.customServiceType : formData.serviceType;

    try {
      await updateServiceAsync(id, {
        date: formData.date,
        odometer: parseInt(formData.odometer) || 0,
        serviceType,
        costPEN: parseFloat(formData.costPEN) || 0,
        provider: formData.provider || undefined,
        notes: formData.notes || undefined,
      });
      router.push("/maintenance");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteServiceAsync(id);
      router.push("/maintenance");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al eliminar");
      setIsDeleting(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", minWidth: 0, maxWidth: "100%",
    height: "3.5rem", padding: "0 1rem",
    borderRadius: "var(--shape-sm)",
    border: "1.5px solid var(--md-outline-variant)",
    background: "transparent", color: "var(--md-on-surface)",
    fontSize: "1rem", outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
      (e.currentTarget.style.borderColor = "var(--md-primary)"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
      (e.currentTarget.style.borderColor = "var(--md-outline-variant)"),
  };

  const sectionCard = "rounded-[var(--shape-xl)] p-5 space-y-4";
  const sectionBg = { background: "var(--md-surface-container)" };

  if (!service) {
    router.replace("/maintenance");
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-4 pb-6">
        {/* Sticky sub-header */}
        <div className="sticky-below-header flex items-center gap-3 py-3" style={{ background: "var(--md-surface)" }}>
          <Link href="/maintenance">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface)" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--md-on-surface)" }}>
              Editar Servicio
            </h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              {service.serviceType}
            </p>
          </div>
        </div>

        {submitError && (
          <div className="p-4 rounded-[var(--shape-md)] text-sm"
            style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Date + Odometer */}
          <div className={sectionCard + " overflow-hidden"} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Fecha y Odómetro
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>Fecha</label>
                <input type="date" value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required disabled={isSubmitting} style={inputBase} {...focusHandlers}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>Odómetro (km)</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.odometer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, odometer: e.target.value }))}
                  required disabled={isSubmitting} style={inputBase} {...focusHandlers}
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4" style={{ color: "var(--color-service, #6750A4)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Tipo de Servicio
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>Servicio</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData((prev) => ({ ...prev, serviceType: e.target.value }))}
                required disabled={isSubmitting}
                style={{ ...inputBase, paddingRight: "2.5rem", appearance: "none" }}
                {...focusHandlers}
              >
                <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>
                  Selecciona el tipo de servicio
                </option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}
                    style={{ color: "var(--md-on-surface)", background: "var(--md-surface-container)" }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {formData.serviceType === "Otro" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
                  Describe el servicio
                </label>
                <input type="text" placeholder="Ej: Cambio de filtro de cabina"
                  value={formData.customServiceType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customServiceType: e.target.value }))}
                  required disabled={isSubmitting} style={inputBase} {...focusHandlers}
                />
              </div>
            )}
          </div>

          {/* Cost */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Costo
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>Total (S/)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00"
                value={formData.costPEN}
                onChange={(e) => setFormData((prev) => ({ ...prev, costPEN: e.target.value }))}
                required disabled={isSubmitting} style={inputBase} {...focusHandlers}
              />
            </div>
          </div>

          {/* Provider */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Taller / Proveedor
              </span>
            </div>
            <input type="text" placeholder="Ej: Derco Center Surco"
              value={formData.provider}
              onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
              disabled={isSubmitting} style={inputBase} {...focusHandlers}
            />
          </div>

          {/* Notes */}
          <div className={sectionCard} style={sectionBg}>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Notas
              </span>
            </div>
            <input type="text" placeholder="Notas adicionales (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isSubmitting} style={inputBase} {...focusHandlers}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="flex-1 h-12 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 border"
              style={{ borderColor: "var(--md-error)", color: "var(--md-error)", background: "transparent" }}
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Eliminando...</>
              ) : (
                <><Trash2 className="w-4 h-4" />Eliminar</>
              )}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || !formData.serviceType}
              className="flex-1 h-12 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "var(--md-primary)", color: "var(--md-on-primary)" }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              ) : (
                <><Save className="w-4 h-4" />Guardar cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
