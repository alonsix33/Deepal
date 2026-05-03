"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { formatDate, formatKm } from "@/lib/utils";
import {
  Car,
  Zap,
  Battery,
  Info,
  Shield,
} from "lucide-react";

const specs = [
  {
    category: "Tren Motriz",
    icon: Zap,
    color: "var(--md-primary)",
    bg: "var(--md-primary-container)",
    items: [
      { label: "Tipo", value: "REEV (Range Extended EV)" },
      { label: "Motor Eléctrico", value: "214 HP (160 kW), 320 Nm" },
      { label: "Generador", value: "1.5L 4-cil, 96 HP" },
      { label: "Tracción", value: "RWD (Trasera)" },
      { label: "Aceleración", value: "0–100 km/h en 7.9 s" },
    ],
  },
  {
    category: "Batería y Autonomía",
    icon: Battery,
    color: "var(--md-tertiary)",
    bg: "var(--md-tertiary-container)",
    items: [
      { label: "Batería", value: "27.28 kWh LFP (CATL)" },
      { label: "Autonomía eléctrica", value: "~125 km (real)" },
      { label: "Autonomía total", value: "1,129 km" },
      { label: "Tanque gasolina", value: "45–51 L" },
    ],
  },
  {
    category: "Carga",
    icon: Zap,
    color: "var(--color-electric)",
    bg: "var(--color-electric-container)",
    items: [
      { label: "AC (Type 2)", value: "7 kW — 3.9 h (0–100%)" },
      { label: "DC (CCS2)", value: "54.5 kW — 30 min (0–80%)" },
      { label: "20–80% AC", value: "~2.3 horas" },
      { label: "30–80% DC", value: "~20 minutos" },
    ],
  },
  {
    category: "Infotainment",
    icon: Info,
    color: "var(--md-secondary)",
    bg: "var(--md-secondary-container)",
    items: [
      { label: "Sistema", value: "Deepal OS 3.0 (Huawei)" },
      { label: "Chip", value: "Snapdragon 8155P" },
      { label: "Pantalla", value: '15.4" 2.5K "Sunflower"' },
      { label: "Audio", value: "8 parlantes" },
      { label: "HUD", value: 'AR Head-Up Display 53"' },
    ],
  },
];

function SpecRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex justify-between items-start py-2.5 gap-4"
      style={
        last
          ? undefined
          : { borderBottom: "1px solid var(--md-outline-variant)" }
      }
    >
      <span className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>
        {label}
      </span>
      <span
        className="text-sm font-medium text-right max-w-[58%]"
        style={{ color: "var(--md-on-surface)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function VehiclePage() {
  const { vehicle } = useStore();

  return (
    <AppLayout>
      <div className="space-y-4 pb-4">
        {/* Page title */}
        <div className="pt-1">
          <h1
            className="text-2xl font-bold"
            style={{
              color: "var(--md-on-surface)",
              fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
            }}
          >
            Mi Vehículo
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
            Información y especificaciones
          </p>
        </div>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-[var(--shape-xl)] gradient-hero px-6 pt-7 pb-6"
          style={{ boxShadow: "0 2px 12px var(--md-shadow)" }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ background: "var(--md-primary)" }}
          />
          <div className="relative">
            <p
              className="type-label-sm tracking-[0.18em] mb-1"
              style={{ color: "var(--md-on-primary-container)", opacity: 0.65 }}
            >
              CHANGAN · DEEPAL
            </p>
            <h2
              style={{
                fontFamily: "'NOS', 'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(40px, 11vw, 56px)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "var(--md-on-primary-container)" }}>DEEPAL </span>
              <span style={{ color: "var(--md-primary)" }}>S05</span>
            </h2>

            <div
              className="flex items-center gap-3 mt-2 text-xs"
              style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}
            >
              <span>{vehicle.trim}</span>
              <span className="w-px h-3" style={{ background: "currentColor", opacity: 0.4 }} />
              <span>{vehicle.color}</span>
              <span className="w-px h-3" style={{ background: "currentColor", opacity: 0.4 }} />
              <span>{vehicle.year}</span>
            </div>

            <div
              className="flex items-center gap-6 mt-5 pt-4"
              style={{ borderTop: "1px solid color-mix(in srgb, var(--md-on-primary-container) 20%, transparent)" }}
            >
              <div>
                <p
                  className="type-label-sm"
                  style={{ color: "var(--md-on-primary-container)", opacity: 0.6 }}
                >
                  Odómetro
                </p>
                <p
                  className="text-xl font-bold mt-0.5"
                  style={{ color: "var(--md-on-primary-container)" }}
                >
                  {formatKm(vehicle.currentOdometer)}
                </p>
              </div>
              <div
                className="w-px self-stretch"
                style={{ background: "color-mix(in srgb, var(--md-on-primary-container) 20%, transparent)" }}
              />
              <div>
                <p
                  className="type-label-sm"
                  style={{ color: "var(--md-on-primary-container)", opacity: 0.6 }}
                >
                  Entrega
                </p>
                <p
                  className="text-xl font-bold mt-0.5"
                  style={{ color: "var(--md-on-primary-container)" }}
                >
                  {formatDate(vehicle.purchaseDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle info card */}
        <div className="card-filled p-5">
          <h3
            className="font-semibold text-sm mb-4 flex items-center gap-2"
            style={{ color: "var(--md-on-surface)" }}
          >
            <Car className="w-4 h-4" style={{ color: "var(--md-primary)" }} />
            Información del Vehículo
          </h3>
          <div className="space-y-0">
            {[
              { label: "Marca", value: vehicle.make },
              { label: "Modelo", value: vehicle.model },
              { label: "Año", value: String(vehicle.year) },
              { label: "Versión", value: vehicle.trim },
              { label: "Color", value: vehicle.color },
              { label: "Fecha de compra", value: formatDate(vehicle.purchaseDate) },
              { label: "Kilometraje actual", value: formatKm(vehicle.currentOdometer) },
            ].map((item, i, arr) => (
              <SpecRow key={item.label} label={item.label} value={item.value} last={i === arr.length - 1} />
            ))}
          </div>
        </div>

        {/* Warranty card */}
        <div className="card-filled p-5">
          <h3
            className="font-semibold text-sm mb-4 flex items-center gap-2"
            style={{ color: "var(--md-on-surface)" }}
          >
            <Shield className="w-4 h-4" style={{ color: "var(--color-service)" }} />
            Garantía
          </h3>
          <SpecRow label="Vehículo" value="5 años o 120,000 km" />
          <SpecRow label="Batería / Alta tensión" value="8 años o 150,000 km" last />
          <div
            className="mt-4 p-3 rounded-[var(--shape-md)]"
            style={{
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
            }}
          >
            <p className="text-sm font-medium">Derco Center Surco (Diego Mendez)</p>
            <p className="text-xs mt-0.5" style={{ opacity: 0.75 }}>Benavides, Surco, Lima</p>
          </div>
        </div>

        {/* Specs */}
        <div>
          <h2
            className="text-base font-semibold mb-3 px-1"
            style={{ color: "var(--md-on-surface)" }}
          >
            Especificaciones Técnicas
          </h2>
          <div className="space-y-3">
            {specs.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.category} className="card-outlined p-5">
                  <h3
                    className="font-semibold text-sm mb-3 flex items-center gap-2"
                    style={{ color: "var(--md-on-surface)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-[var(--shape-sm)] flex items-center justify-center"
                      style={{ background: section.bg, color: section.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {section.category}
                  </h3>
                  <div>
                    {section.items.map((item, i) => (
                      <SpecRow
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        last={i === section.items.length - 1}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
