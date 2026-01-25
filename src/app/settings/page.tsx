"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/lib/utils";
import {
  Settings,
  Zap,
  Download,
  Upload,
  Trash2,
  Info,
  Car,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, vehicle, updateVehicle, charges, fuelUps, services } =
    useStore();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleExportData = () => {
    const data = {
      vehicle,
      charges,
      fuelUps,
      services,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deepal-s05-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    localStorage.removeItem("deepal-s05-storage");
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Configuracion</h1>
          <p className="text-[var(--muted-foreground)]">
            Preferencias y ajustes de la aplicacion
          </p>
        </div>

        {/* Electricity Rate */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--deepal-cyan)]" />
            Tarifa Electrica
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="electricityRate">Precio por kWh (S/)</Label>
              <Input
                id="electricityRate"
                type="number"
                step="0.01"
                min="0"
                value={settings.electricityRateKwh}
                onChange={(e) =>
                  updateSettings({
                    electricityRateKwh: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Tarifa residencial Lima (Luz del Sur): ~S/ 0.73/kWh para consumo
                mayor a 140 kWh/mes
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--secondary)]">
              <p className="text-sm">
                <span className="text-[var(--muted-foreground)]">
                  Costo por carga completa (27.28 kWh):
                </span>{" "}
                <span className="font-medium">
                  {formatCurrency(settings.electricityRateKwh * 27.28)}
                </span>
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Vehicle Settings */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-[var(--deepal-blue)]" />
            Vehiculo
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentOdometer">Kilometraje Actual</Label>
              <Input
                id="currentOdometer"
                type="number"
                min="0"
                value={vehicle.currentOdometer}
                onChange={(e) =>
                  updateVehicle({
                    currentOdometer: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometerStart">Kilometraje Inicial</Label>
              <Input
                id="odometerStart"
                type="number"
                min="0"
                value={vehicle.odometerStart}
                onChange={(e) =>
                  updateVehicle({
                    odometerStart: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        </GlassCard>

        {/* Language and Units */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" />
            Preferencias
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value: "es" | "en") =>
                  updateSettings({ language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Espanol</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSettings({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEN">Soles (S/)</SelectItem>
                  <SelectItem value="USD">Dolares ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Data Management */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--deepal-teal)]" />
            Gestion de Datos
          </h3>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4" />
              Exportar Datos (JSON)
            </Button>

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Todos los Datos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar todos los datos</DialogTitle>
                  <DialogDescription>
                    Esta accion eliminara permanentemente todos tus registros de
                    cargas, combustible, mantenimiento y configuraciones. Esta
                    accion no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleResetData}
                  >
                    Eliminar Todo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </GlassCard>

        {/* App Info */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--muted-foreground)]" />
            Informacion
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">Plataforma</span>
              <span>PWA (Next.js)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--muted-foreground)]">Desarrollador</span>
              <span>Alonso</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[var(--secondary)] text-xs text-[var(--muted-foreground)]">
            Deepal S05 REEV Tracker - Aplicacion para rastrear consumo, costos y
            mantenimiento del vehiculo. Disenada con el estilo Deepal OS 3.0.
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
