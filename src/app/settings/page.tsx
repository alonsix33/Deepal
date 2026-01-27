"use client";

import React, { useState, useEffect, useRef } from "react";
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
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkNotificationPermission,
  requestNotificationPermission,
} from "@/lib/serviceWorker";
import {
  Settings,
  Zap,
  Download,
  Upload,
  Trash2,
  Info,
  Car,
  Bell,
  BellOff,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, vehicle, updateVehicle } = useStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<"loading" | "enabled" | "disabled" | "denied">("loading");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check notification status on mount
  useEffect(() => {
    async function checkStatus() {
      const permission = await checkNotificationPermission();
      if (permission === "denied") {
        setNotificationStatus("denied");
      } else if (permission === "granted" && settings.notificationsEnabled) {
        setNotificationStatus("enabled");
      } else {
        setNotificationStatus("disabled");
      }
    }
    checkStatus();
    // Register service worker
    registerServiceWorker();
  }, [settings.notificationsEnabled]);

  // Handle push notification toggle
  const handleNotificationToggle = async () => {
    if (notificationStatus === "denied") {
      alert("Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración de tu navegador.");
      return;
    }

    if (notificationStatus === "enabled") {
      await unsubscribeFromPushNotifications();
      updateSettings({ notificationsEnabled: false });
      setNotificationStatus("disabled");
    } else {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        await subscribeToPushNotifications();
        updateSettings({ notificationsEnabled: true });
        setNotificationStatus("enabled");
      } else {
        setNotificationStatus("denied");
      }
    }
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deepal-s05-data-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const imported = result.imported;
        const messages = [];
        if (imported.charges) messages.push(`${imported.charges} cargas`);
        if (imported.fuelUps) messages.push(`${imported.fuelUps} combustible`);
        if (imported.services) messages.push(`${imported.services} servicios`);

        setImportResult({
          success: true,
          message: `Importado: ${messages.join(", ")}`,
        });
      } else {
        setImportResult({
          success: false,
          message: result.error || "Error al importar",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        message: "Error al importar datos",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetData = () => {
    localStorage.removeItem("deepal-s05-storage");
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-[var(--muted-foreground)]">
            Preferencias y ajustes de la aplicación
          </p>
        </header>

        {/* Push Notifications */}
        <GlassCard role="region" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--deepal-cyan)]" aria-hidden="true" />
            Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Recordatorios de Kilometraje</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Recibe un recordatorio mensual para registrar tu kilometraje
                </p>
              </div>
              <Button
                variant={notificationStatus === "enabled" ? "cyan" : "outline"}
                size="sm"
                onClick={handleNotificationToggle}
                disabled={notificationStatus === "loading"}
                aria-pressed={notificationStatus === "enabled"}
                aria-label={notificationStatus === "enabled" ? "Desactivar notificaciones" : "Activar notificaciones"}
              >
                {notificationStatus === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : notificationStatus === "enabled" ? (
                  <>
                    <Bell className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only md:not-sr-only">Activadas</span>
                  </>
                ) : notificationStatus === "denied" ? (
                  <>
                    <BellOff className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only md:not-sr-only">Bloqueadas</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only md:not-sr-only">Activar</span>
                  </>
                )}
              </Button>
            </div>
            {notificationStatus === "denied" && (
              <p className="text-sm text-[var(--deepal-warning)]" role="alert">
                Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.
              </p>
            )}
          </div>
        </GlassCard>

        {/* Electricity Rate */}
        <GlassCard role="region" aria-labelledby="electricity-heading">
          <h2 id="electricity-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--deepal-cyan)]" aria-hidden="true" />
            Tarifa Eléctrica
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="electricityRate">Precio por kWh (S/)</Label>
              <Input
                id="electricityRate"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={settings.electricityRateKwh}
                onChange={(e) =>
                  updateSettings({
                    electricityRateKwh: parseFloat(e.target.value) || 0,
                  })
                }
                aria-describedby="electricity-help"
              />
              <p id="electricity-help" className="text-xs text-[var(--muted-foreground)]">
                Tarifa residencial Lima (Luz del Sur): ~S/ 0.73/kWh para consumo
                mayor a 140 kWh/mes
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--secondary)]" role="status" aria-live="polite">
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
        <GlassCard role="region" aria-labelledby="vehicle-heading">
          <h2 id="vehicle-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-[var(--deepal-blue)]" aria-hidden="true" />
            Vehículo
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentOdometer">Kilometraje Actual</Label>
              <Input
                id="currentOdometer"
                type="number"
                min="0"
                inputMode="numeric"
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
                inputMode="numeric"
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
        <GlassCard role="region" aria-labelledby="preferences-heading">
          <h2 id="preferences-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" aria-hidden="true" />
            Preferencias
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language-select">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value: "es" | "en") =>
                  updateSettings({ language: value })
                }
              >
                <SelectTrigger id="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-select">Moneda</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSettings({ currency: value })}
              >
                <SelectTrigger id="currency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEN">Soles (S/)</SelectItem>
                  <SelectItem value="USD">Dólares ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Data Management */}
        <GlassCard role="region" aria-labelledby="data-heading">
          <h2 id="data-heading" className="font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[var(--deepal-teal)]" aria-hidden="true" />
            Gestión de Datos
          </h2>
          <div className="space-y-4">
            {/* Export Excel */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportExcel}
              disabled={isExporting}
              aria-busy={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
              Exportar a Excel (.xlsx)
            </Button>

            {/* Import */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
                aria-describedby="import-help"
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                aria-busy={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileUp className="w-4 h-4" aria-hidden="true" />
                )}
                Importar Datos
              </Button>
              <p id="import-help" className="text-xs text-[var(--muted-foreground)] mt-2">
                Formatos soportados: Excel (.xlsx, .xls) o JSON
              </p>
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  importResult.success
                    ? "bg-[var(--deepal-teal)]/10 text-[var(--deepal-teal)]"
                    : "bg-[var(--destructive)]/10 text-[var(--destructive)]"
                }`}
                role="alert"
              >
                {importResult.success ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
            )}

            {/* Reset */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Eliminar Todos los Datos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar todos los datos</DialogTitle>
                  <DialogDescription>
                    Esta accion eliminará permanentemente todos tus registros de
                    cargas, combustible, mantenimiento y configuraciónes. Esta
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
        <GlassCard role="region" aria-labelledby="info-heading">
          <h2 id="info-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--muted-foreground)]" aria-hidden="true" />
            Información
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <dt className="text-[var(--muted-foreground)]">Versión</dt>
              <dd>1.0.0</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <dt className="text-[var(--muted-foreground)]">Plataforma</dt>
              <dd>PWA (Next.js)</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-[var(--muted-foreground)]">Desarrollador</dt>
              <dd>Alonso</dd>
            </div>
          </dl>
          <div className="mt-4 p-3 rounded-lg bg-[var(--secondary)] text-xs text-[var(--muted-foreground)]">
            Deepal S05 REEV Tracker - Aplicación para rastrear consumo, costos y
            mantenimiento del vehículo. Diseñada con el estilo Deepal OS 3.0.
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
