"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Fuel, Save, Loader2, MapPin, FileText, Gauge } from "lucide-react";
import Link from "next/link";

type FuelField = "gallons" | "costPEN" | "costPerGallon";

export default function NewFuelPage() {
  const router = useRouter();
  const { addFuelUpAsync, vehicle, isLoading, error } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    odometer: vehicle.currentOdometer.toString(),
    gallons: "",
    costPEN: "",
    costPerGallon: "",
    location: "",
    notes: "",
  });

  // Track the two most recently edited manual fields to determine which to auto-calculate
  const manualFieldsRef = useRef<FuelField[]>([]);

  const recalculate = (
    field: FuelField,
    value: string,
    current: typeof formData
  ): Partial<typeof formData> => {
    // Add this field to the manual queue (max 2)
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
    setFormData((prev) => ({
      ...prev,
      ...recalculate(field, value, prev),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    try {
      await addFuelUpAsync({
        date: `${formData.date}T${timeStr}:00`,
        odometer: parseInt(formData.odometer) || 0,
        gallons: parseFloat(formData.gallons) || 0,
        costPEN: parseFloat(formData.costPEN) || 0,
        costPerGallon: parseFloat(formData.costPerGallon) || 0,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      router.push("/fuel");
    } catch (err) {
      console.error("Error saving fuel up:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Error al guardar el combustible"
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

  const isAutoField = (field: FuelField) =>
    manualFieldsRef.current.length === 2 && !manualFieldsRef.current.includes(field);

  const fieldStyle = (field: FuelField): React.CSSProperties => ({
    ...inputBase,
    background: isAutoField(field)
      ? "var(--md-surface-container-highest)"
      : "transparent",
    color: isAutoField(field)
      ? "var(--md-on-surface-variant)"
      : "var(--md-on-surface)",
  });

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-4 pb-6">
        {/* Sticky sub-header */}
        <div
          className="sticky-below-header flex items-center gap-3 py-3"
          style={{ background: "var(--md-surface)" }}
        >
          <Link href="/fuel">
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
              Nueva Carga de Combustible
            </h1>
            <p
              className="text-xs"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              Registra una recarga de gasolina
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
          <div
            className="rounded-[var(--shape-xl)] p-5 space-y-4"
            style={{ background: "var(--md-surface-container)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Gauge
                className="w-4 h-4"
                style={{ color: "var(--md-primary)" }}
              />
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--md-primary)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--md-outline-variant)")
                  }
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--md-primary)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--md-outline-variant)")
                  }
                />
              </div>
            </div>
          </div>

          {/* Three-way fuel cost calculator */}
          <div
            className="rounded-[var(--shape-xl)] p-5 space-y-4"
            style={{ background: "var(--md-surface-container)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Fuel
                className="w-4 h-4"
                style={{ color: "var(--color-fuel, #B25200)" }}
              />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Detalles de Carga
              </span>
            </div>

            <p
              className="text-xs"
              style={{ color: "var(--md-on-surface-variant)", opacity: 0.75 }}
            >
              Ingresa dos valores — el tercero se calcula automáticamente.
            </p>

            {/* Gallons */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Galones
                </label>
                {isAutoField("gallons") && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--md-primary-container)",
                      color: "var(--md-on-primary-container)",
                    }}
                  >
                    auto
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.001"
                min="0"
                max="15"
                placeholder="0.000"
                value={formData.gallons}
                onChange={(e) => handleFieldChange("gallons", e.target.value)}
                disabled={isSubmitting}
                style={fieldStyle("gallons")}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--md-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--md-outline-variant)")
                }
              />
            </div>

            {/* Cost total */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Costo Total (S/)
                </label>
                {isAutoField("costPEN") && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--md-primary-container)",
                      color: "var(--md-on-primary-container)",
                    }}
                  >
                    auto
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.costPEN}
                onChange={(e) => handleFieldChange("costPEN", e.target.value)}
                required
                disabled={isSubmitting}
                style={fieldStyle("costPEN")}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--md-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--md-outline-variant)")
                }
              />
            </div>

            {/* Price per gallon */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Precio por Galón (S/)
                </label>
                {isAutoField("costPerGallon") && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--md-primary-container)",
                      color: "var(--md-on-primary-container)",
                    }}
                  >
                    auto
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.costPerGallon}
                onChange={(e) =>
                  handleFieldChange("costPerGallon", e.target.value)
                }
                disabled={isSubmitting}
                style={fieldStyle("costPerGallon")}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--md-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--md-outline-variant)")
                }
              />
            </div>

            {/* Summary pill */}
            {formData.gallons && formData.costPEN && formData.costPerGallon && (
              <div
                className="flex justify-between items-center px-4 py-3 rounded-[var(--shape-md)]"
                style={{ background: "var(--md-primary-container)" }}
              >
                <div className="text-center">
                  <p
                    className="text-xs"
                    style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}
                  >
                    Galones
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: "var(--md-on-primary-container)" }}
                  >
                    {parseFloat(formData.gallons).toFixed(3)}
                  </p>
                </div>
                <span
                  className="text-lg"
                  style={{ color: "var(--md-on-primary-container)", opacity: 0.4 }}
                >
                  ×
                </span>
                <div className="text-center">
                  <p
                    className="text-xs"
                    style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}
                  >
                    S/ / gal
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: "var(--md-on-primary-container)" }}
                  >
                    {parseFloat(formData.costPerGallon).toFixed(2)}
                  </p>
                </div>
                <span
                  className="text-lg"
                  style={{ color: "var(--md-on-primary-container)", opacity: 0.4 }}
                >
                  =
                </span>
                <div className="text-center">
                  <p
                    className="text-xs"
                    style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}
                  >
                    Total
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: "var(--md-on-primary-container)" }}
                  >
                    S/ {parseFloat(formData.costPEN).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div
            className="rounded-[var(--shape-xl)] p-5 space-y-3"
            style={{ background: "var(--md-surface-container)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin
                className="w-4 h-4"
                style={{ color: "var(--md-secondary)" }}
              />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Ubicación
              </span>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Gasolinera (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Primax, Repsol, Pecsa..."
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                disabled={isSubmitting}
                style={inputBase}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--md-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--md-outline-variant)")
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div
            className="rounded-[var(--shape-xl)] p-5 space-y-3"
            style={{ background: "var(--md-surface-container)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText
                className="w-4 h-4"
                style={{ color: "var(--md-secondary)" }}
              />
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Notas
              </span>
            </div>
            <input
              type="text"
              placeholder="Ej: Viaje a Paracas, emergencia..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isSubmitting}
              style={inputBase}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--md-primary)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--md-outline-variant)")
              }
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Link href="/fuel" className="flex-1">
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
              disabled={isSubmitting || isLoading}
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
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
