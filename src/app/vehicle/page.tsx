"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { formatDate, formatKm } from "@/lib/utils";
import {
  Car,
  Zap,
  Fuel,
  Battery,
  Gauge,
  Calendar,
  Shield,
  Info,
} from "lucide-react";

const CarModel = dynamic(
  () => import("@/components/3d/CarModel").then((mod) => mod.CarModel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Car className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-sm text-[var(--muted-foreground)]">
            Cargando modelo 3D...
          </span>
        </div>
      </div>
    ),
  }
);

export default function VehiclePage() {
  const { vehicle } = useStore();

  const specs = [
    {
      category: "Tren Motriz",
      icon: Zap,
      items: [
        { label: "Tipo", value: "REEV (Range Extended EV)" },
        { label: "Motor Eléctrico", value: "214 HP (160 kW), 320 Nm" },
        { label: "Generador", value: "1.5L 4-cil, 96 HP (solo genera electricidad)" },
        { label: "Tracción", value: "RWD (Trasera)" },
        { label: "Aceleración", value: "0-100 km/h en 7.9s" },
      ],
    },
    {
      category: "Batería y Autonomía",
      icon: Battery,
      items: [
        { label: "Batería", value: "27.28 kWh LFP (CATL)" },
        { label: "Autonomía Electrica", value: "~125 km (real)" },
        { label: "Autonomía Total", value: "1,129 km" },
        { label: "Tanque Gasolina", value: "45-51 L" },
      ],
    },
    {
      category: "Carga",
      icon: Zap,
      items: [
        { label: "Carga AC", value: "7 kW (Type 2) - 3.9h 0-100%" },
        { label: "Carga DC", value: "54.5 kW (CCS2) - 30min 0-80%" },
        { label: "20-80% AC", value: "~2.3 horas" },
        { label: "30-80% DC", value: "~20 minutos" },
      ],
    },
    {
      category: "Infotainment",
      icon: Info,
      items: [
        { label: "Sistema", value: "Deepal OS 3.0 (Huawei)" },
        { label: "Chip", value: "Qualcomm Snapdragon 8155P" },
        { label: "Pantalla", value: '15.4" 2.5K "Sunflower"' },
        { label: "Audio", value: "8 parlantes" },
        { label: "HUD", value: 'AR Head-Up Display 53"' },
      ],
    },
  ];

  const warrantyInfo = [
    { label: "Vehículo", value: "5 años o 120,000 km" },
    { label: "Batería/Alta Tensión", value: "8 años o 150,000 km" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Mi Vehículo</h1>
          <p className="text-[var(--muted-foreground)]">
            Información y especificaciones
          </p>
        </div>

        {/* 3D Model */}
        <GlassCard className="overflow-hidden">
          <div className="h-[400px]">
            <CarModel autoRotate showControls />
          </div>
        </GlassCard>

        {/* Vehicle Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-[var(--deepal-cyan)]" />
              Información del Vehículo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Marca</span>
                <span className="font-medium">{vehicle.make}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Modelo</span>
                <span className="font-medium">{vehicle.model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Año</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Versión</span>
                <span className="font-medium">{vehicle.trim}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Color</span>
                <span className="font-medium">{vehicle.color}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">
                  Fecha de Compra
                </span>
                <span className="font-medium">
                  {formatDate(vehicle.purchaseDate)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--muted-foreground)]">
                  Kilometraje Actual
                </span>
                <span className="font-medium">
                  {formatKm(vehicle.currentOdometer)}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--deepal-blue)]" />
              Garantía
            </h3>
            <div className="space-y-3">
              {warrantyInfo.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between py-2 ${
                    index < warrantyInfo.length - 1
                      ? "border-b border-[var(--border)]"
                      : ""
                  }`}
                >
                  <span className="text-[var(--muted-foreground)]">
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[var(--deepal-cyan)]/5 border border-[var(--deepal-cyan)]/20">
              <p className="text-sm">
                <span className="font-medium text-[var(--deepal-cyan)]">
                  Vendedor:
                </span>{" "}
                Derco Center Surco (Diego Mendez)
              </p>
              <p className="text-sm mt-1 text-[var(--muted-foreground)]">
                Benavides, Surco, Lima
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Especificaciones Técnicas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {specs.map((section) => (
              <GlassCard key={section.category}>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <section.icon className="w-5 h-5 text-[var(--deepal-cyan)]" />
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between py-2 ${
                        index < section.items.length - 1
                          ? "border-b border-[var(--border)]"
                          : ""
                      }`}
                    >
                      <span className="text-[var(--muted-foreground)] text-sm">
                        {item.label}
                      </span>
                      <span className="font-medium text-sm text-right max-w-[60%]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
