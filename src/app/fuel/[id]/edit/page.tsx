"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { todayLocalISO } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Fuel, Save, Loader2, Trash2, MapPin, FileText, Gauge } from "lucide-react";
import Link from "next/link";

type FuelField = "gallons" | "costPEN" | "costPerGallon";

export default function EditFuelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { fuelUps, updateFuelUpAsync, deleteFuelUpAsync } = useStore();
  const fuelUp = fuelUps.find((f) => f.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: fuelUp ? fuelUp.date : todayLocalISO(),
    odometer: String(fuelUp?.odometer ?? 0),
    gallons: fuelUp ? String(fuelUp.gallons) : "",
    costPEN: fuelUp ? String(fuelUp.costPEN) : "",
    costPerGallon: fuelUp ? String(fuelUp.costPerGallon) : "",
    location: fuelUp?.location ?? "",
    notes: fuelUp?.notes ?? "",
  });

  const manualFieldsRef = useRef<FuelField[]>([]);

  const recalculate = (
    field: FuelField,
    value: string,
    current: typeof formData
  ): Partial<typeof formData> => {
    const queue = manualFieldsRef.current.filter((f) => f !== field);
    queue.push(field);
    if (queue.length > 2) queue.shift();
    manualFieldsRef.current = queue;

    const allFields: FuelField[] = ["gallons", "costPEN", "costPerGallon"];
    const autoField = allFields.find((f) => !queue.includes(f));
    const updated: Partial<typeof formData> = { [field]: value };

    if (!autoField || queue.length < 2) return updated;

    const g = parseFloat(field === "gallons" ? value : current.gallons);
    const c = parseFloat(field === "costPEN" ? value : current.costPEN);
    const p = parseFloat(field === "costPerGallon" ? value : current.costPerGallon);

    if (autoField === "costPEN" && !isNaN(g) && !isNaN(p) && g > 0) {
      updated.costPEN = (g * p).toFixed(2);
    } else if (autoField === "gallons" && !isNaN(c) && !isNaN(p) && p > 0) {
      updated.gallons = (c / p).toFixed(3);
    } else if (autoField === "costPerGallon" && !isNaN(g) && !isNaN(c) && g > 0) {
      updated.costPerGallon = (c / g).toFixed(2);
    }
    return updated;
  };

  const handleFieldChange = (field: FuelField, value: string) => {
    setFormData((prev) => ({ ...prev, ...recalculate(field, value, prev) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await updateFuelUpAsync(id, {
        date: `${formData.date}T12:00:00`,
        odometer: parseInt(formData.odometer) || 0,
        gallons: parseFloat(formData.gallons) || 0,
        costPEN: parseFloat(formData.costPEN) || 0,
        costPerGallon: parseFloat(formData.costPerGallon) || 0,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });
      router.push("/fuel");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFuelUpAsync(id);
      router.push("/fuel");
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

  const isAutoField = (field: FuelField) =>
    manualFieldsRef.current.length === 2 && !manualFieldsRef.current.includes(field);

  const fieldStyle = (field: FuelField): React.CSSProperties => ({
    ...inputBase,
    background: isAutoField(field) ? "var(--md-surface-container-highest)" : "transparent",
    color: isAutoField(field) ? "var(--md-on-surface-variant)" : "var(--md-on-surface)",
  });

  if (!fuelUp) {
    router.replace("/fuel");
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-4 pb-6">
        {/* Sticky sub-header */}
        <div className="sticky-below-header flex items-center gap-3 py-3" style={{ background: "var(--md-surface)" }}>
          <Link href="/fuel">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface)" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--md-on-surface)" }}>
              Editar Combustible
            </h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              {fuelUp.location || "Gasolinera"}
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
          <div className="rounded-[var(--shape-xl)] p-5 space-y-4 overflow-hidden" style={{ background: "var(--md-surface-container)" }}>
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
                  required disabled={isSubmitting} style={inputBase}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--md-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--md-outline-variant)")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>Odómetro (km)</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.odometer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, odometer: e.target.value }))}
                  required disabled={isSubmitting} style={inputBase}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--md-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--md-outline-variant)")}
                />
              </div>
            </div>
          </div>

          {/* Three-way fuel cost calculator */}
          <div className="rounded-[var(--shape-xl)] p-5 space-y-4" style={{ background: "var(--md-surface-container)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Fuel className="w-4 h-4" style={{ color: "var(--color-fuel, #B25200)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Detalles de Carga
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)", opacity: 0.75 }}>
              Edita dos valores — el tercero se recalcula automáticamente.
            </p>

            {(["gallons", "costPEN", "costPerGallon"] as FuelField[]).map((field) => {
              const labels = { gallons: "Galones", costPEN: "Costo Total (S/)", costPerGallon: "Precio por Galón (S/)" };
              const placeholders = { gallons: "0.000", costPEN: "0.00", costPerGallon: "0.00" };
              const steps = { gallons: "0.001", costPEN: "0.01", costPerGallon: "0.01" };
              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
                      {labels[field]}
                    </label>
                    {isAutoField(field) && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: "var(--md-primary-container)", color: "var(--md-on-primary-container)" }}>
                        auto
                      </span>
                    )}
                  </div>
                  <input
                    type="number" step={steps[field]} min="0"
                    placeholder={placeholders[field]}
                    value={formData[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    disabled={isSubmitting}
                    style={fieldStyle(field)}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--md-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--md-outline-variant)")}
                  />
                </div>
              );
            })}

            {formData.gallons && formData.costPEN && formData.costPerGallon && (
              <div className="flex justify-between items-center px-4 py-3 rounded-[var(--shape-md)]"
                style={{ background: "var(--md-primary-container)" }}>
                {[
                  { label: "Galones", val: parseFloat(formData.gallons).toFixed(3) },
                  { label: "×", val: null },
                  { label: "S/ / gal", val: parseFloat(formData.costPerGallon).toFixed(2) },
                  { label: "=", val: null },
                  { label: "Total", val: `S/ ${parseFloat(formData.costPEN).toFixed(2)}` },
                ].map((item, i) =>
                  item.val === null ? (
                    <span key={i} className="text-lg" style={{ color: "var(--md-on-primary-container)", opacity: 0.4 }}>
                      {item.label}
                    </span>
                  ) : (
                    <div key={i} className="text-center">
                      <p className="text-xs" style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}>{item.label}</p>
                      <p className="text-base font-bold" style={{ color: "var(--md-on-primary-container)" }}>{item.val}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="rounded-[var(--shape-xl)] p-5 space-y-3" style={{ background: "var(--md-surface-container)" }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Ubicación
              </span>
            </div>
            <input type="text" placeholder="Ej: Primax, Repsol, Pecsa..." value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              disabled={isSubmitting} style={inputBase}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--md-primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--md-outline-variant)")}
            />
          </div>

          {/* Notes */}
          <div className="rounded-[var(--shape-xl)] p-5 space-y-3" style={{ background: "var(--md-surface-container)" }}>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" style={{ color: "var(--md-secondary)" }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--md-on-surface-variant)" }}>
                Notas
              </span>
            </div>
            <input type="text" placeholder="Notas adicionales..." value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isSubmitting} style={inputBase}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--md-primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--md-outline-variant)")}
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
              disabled={isSubmitting || isDeleting}
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
