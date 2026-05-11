"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { formatCurrency, todayLocalISO } from "@/lib/utils";
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
  Gauge,
  Bell,
  BellOff,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
  Plus,
  Fuel,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type OdomEntry = {
  date: string;
  odometer: number;
  source: "manual" | "charge" | "fuel" | "service";
  notes?: string | null;
};

const SOURCE_CFG = {
  manual:  { label: "Manual",      bg: "var(--md-secondary-container)",  color: "var(--md-on-secondary-container)", Icon: Gauge   },
  charge:  { label: "Carga",        bg: "var(--md-primary-container)",    color: "var(--md-on-primary-container)",   Icon: Zap     },
  fuel:    { label: "Combustible",  bg: "var(--color-fuel-container)",    color: "var(--color-fuel)",                Icon: Fuel    },
  service: { label: "Servicio",     bg: "var(--color-service-container)", color: "var(--color-service)",             Icon: Wrench  },
} as const;

const MAX_VISIBLE = 5;

function OdometerLogList({
  entries,
  showAll,
  onToggleShowAll,
}: {
  entries: OdomEntry[];
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  const visible = showAll ? entries : entries.slice(0, MAX_VISIBLE);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 rounded-[var(--shape-lg)]" style={{ background: "var(--md-surface-container)" }}>
        <Gauge className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--md-outline)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>Sin registros aún</p>
        <p className="text-xs mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
          Agrega una lectura manual o ingresa el odómetro en tus cargas
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--md-on-surface-variant)" }}>
        Historial · {entries.length} {entries.length === 1 ? "registro" : "registros"}
      </p>
      <div className="rounded-[var(--shape-lg)] overflow-hidden" style={{ border: "1px solid var(--md-outline-variant)" }}>
        {visible.map((entry, i) => {
          const cfg = SOURCE_CFG[entry.source];
          const Icon = cfg.Icon;
          return (
            <div
              key={`${entry.source}-${entry.date}-${entry.odometer}-${i}`}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < visible.length - 1 ? "1px solid var(--md-outline-variant)" : undefined }}
            >
              <div
                className="w-8 h-8 rounded-[var(--shape-sm)] flex items-center justify-center shrink-0"
                style={{ background: cfg.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold" style={{ color: "var(--md-on-surface)", fontFamily: "var(--font-display, system-ui)" }}>
                    {entry.odometer.toLocaleString("es-PE")}
                  </span>
                  <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>km</span>
                </div>
                {entry.notes && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>{entry.notes}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                  {new Date(entry.date).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "2-digit" })}
                </p>
                <span
                  className="inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {entries.length > MAX_VISIBLE && (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-[var(--shape-md)] transition-colors"
          style={{ color: "var(--md-primary)" }}
        >
          {showAll
            ? <><ChevronUp className="w-3.5 h-3.5" />Ver menos</>
            : <><ChevronDown className="w-3.5 h-3.5" />Ver todos ({entries.length - MAX_VISIBLE} más)</>}
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    vehicle,
    charges,
    fuelUps,
    services,
    odometerLogs,
    addOdometerLogAsync,
    initializeFromAPI,
  } = useStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [odometerForm, setOdometerForm] = useState({
    date: todayLocalISO(),
    odometer: "",
    notes: "",
  });
  const [isAddingOdometer, setIsAddingOdometer] = useState(false);
  const [odometerError, setOdometerError] = useState<string | null>(null);
  const [showAllOdometer, setShowAllOdometer] = useState(false);
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

        // Refresh store from API to get imported data
        useStore.setState({ isInitialized: false });
        await initializeFromAPI();

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

  const handleAddOdometer = async (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseInt(odometerForm.odometer);
    if (!km || km <= 0) return;
    setIsAddingOdometer(true);
    setOdometerError(null);
    try {
      await addOdometerLogAsync({
        date: `${odometerForm.date}T12:00:00`,
        odometer: km,
        notes: odometerForm.notes || undefined,
      });
      setOdometerForm((prev) => ({ ...prev, odometer: "", notes: "" }));
    } catch {
      setOdometerError("Error al guardar. Intenta de nuevo.");
    } finally {
      setIsAddingOdometer(false);
    }
  };

  const allOdometerEntries = useMemo((): OdomEntry[] => {
    const entries: OdomEntry[] = [
      ...odometerLogs.map((l) => ({ date: l.date, odometer: l.odometer, source: "manual" as const, notes: l.notes })),
      ...charges.filter((c) => c.odometerEnd && c.odometerEnd > 0).map((c) => ({ date: c.date, odometer: c.odometerEnd!, source: "charge" as const, notes: c.location })),
      ...fuelUps.filter((f) => f.odometer > 0).map((f) => ({ date: f.date, odometer: f.odometer, source: "fuel" as const, notes: f.location })),
      ...services.filter((s) => s.odometer > 0).map((s) => ({ date: s.date, odometer: s.odometer, source: "service" as const, notes: s.serviceType })),
    ];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [odometerLogs, charges, fuelUps, services]);

  const handleResetData = async () => {
    try {
      // Clear database data via API
      await fetch("/api/reset", { method: "POST" });
    } catch (error) {
      console.error("Error resetting database:", error);
    }
    // Clear local storage
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
                step="0.0001"
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
                Tarifa BT5B (tu edificio): S/ 0.6861/kWh
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="batteryCapacity">Capacidad Batería (kWh)</Label>
                <Input
                  id="batteryCapacity"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={settings.batteryCapacity}
                  onChange={(e) =>
                    updateSettings({
                      batteryCapacity: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chargingEfficiency">Eficiencia Carga (%)</Label>
                <Input
                  id="chargingEfficiency"
                  type="number"
                  step="1"
                  min="50"
                  max="100"
                  inputMode="numeric"
                  value={Math.round(settings.chargingEfficiency * 100)}
                  onChange={(e) =>
                    updateSettings({
                      chargingEfficiency: (parseInt(e.target.value) || 90) / 100,
                    })
                  }
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--secondary)]" role="status" aria-live="polite">
              <p className="text-sm">
                <span className="text-[var(--muted-foreground)]">
                  Costo carga completa ({settings.batteryCapacity} kWh):
                </span>{" "}
                <span className="font-medium">
                  {formatCurrency(
                    (settings.electricityRateKwh * settings.batteryCapacity) /
                      settings.chargingEfficiency
                  )}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] ml-2">
                  (con pérdidas)
                </span>
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Eco-Metrics Reference Parameters */}
        <GlassCard role="region" aria-labelledby="eco-heading">
          <h2 id="eco-heading" className="font-semibold mb-1 flex items-center gap-2">
            <Fuel className="w-5 h-5" style={{ color: "var(--color-fuel)" }} aria-hidden="true" />
            Parámetros de Ahorro
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--md-on-surface-variant)" }}>
            Usados para calcular el ahorro vs gasolina y CO₂ evitado
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gasolineRef">Referencia gasolina (L/100km)</Label>
                <Input
                  id="gasolineRef"
                  type="number"
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  value={settings.gasolineRefConsumptionL100km ?? 7.5}
                  onChange={(e) =>
                    updateSettings({ gasolineRefConsumptionL100km: parseFloat(e.target.value) || 7.5 })
                  }
                />
                <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  SUV gasolina similar (Toyota/Honda)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasolinePrice">Precio gasolina (S//L)</Label>
                <Input
                  id="gasolinePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={settings.gasolinePricePEN ?? 5.87}
                  onChange={(e) =>
                    updateSettings({ gasolinePricePEN: parseFloat(e.target.value) || 5.87 })
                  }
                />
                <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  Gasohol 90 actual en Lima
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="co2Grid">Intensidad CO₂ red (g/kWh)</Label>
                <Input
                  id="co2Grid"
                  type="number"
                  step="1"
                  min="0"
                  inputMode="numeric"
                  value={settings.co2GridIntensityGkwh ?? 218}
                  onChange={(e) =>
                    updateSettings({ co2GridIntensityGkwh: parseFloat(e.target.value) || 218 })
                  }
                />
                <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  Red eléctrica Perú 2024
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evConsumption">Consumo S05 (kWh/100km)</Label>
                <Input
                  id="evConsumption"
                  type="number"
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  value={settings.evConsumptionKwh100km ?? 15.1}
                  onChange={(e) =>
                    updateSettings({ evConsumptionKwh100km: parseFloat(e.target.value) || 15.1 })
                  }
                />
                <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                  WLTP S05 REEV eléctrico
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Odometer Log */}
        <GlassCard role="region" aria-labelledby="odometer-heading">
          {/* Header with current km */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 id="odometer-heading" className="font-semibold flex items-center gap-2" style={{ color: "var(--md-on-surface)" }}>
                <Gauge className="w-5 h-5" style={{ color: "var(--md-primary)" }} />
                Odómetro
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                Historial de km registrados
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-[var(--shape-lg)] text-right"
              style={{ background: "var(--md-primary-container)" }}
            >
              <p
                className="text-2xl font-bold leading-none"
                style={{ color: "var(--md-on-primary-container)", fontFamily: "var(--font-display, system-ui)" }}
              >
                {vehicle.currentOdometer.toLocaleString("es-PE")}
              </p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: "var(--md-on-primary-container)", opacity: 0.7 }}>
                km actuales
              </p>
            </div>
          </div>

          {/* Add new log form */}
          <div
            className="rounded-[var(--shape-lg)] p-4 mb-5"
            style={{ background: "var(--md-surface-container)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--md-on-surface-variant)" }}>
              + Agregar lectura manual
            </p>
            <form onSubmit={handleAddOdometer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>Fecha</Label>
                  <Input
                    type="date"
                    value={odometerForm.date}
                    onChange={(e) => setOdometerForm((p) => ({ ...p, date: e.target.value }))}
                    required
                    disabled={isAddingOdometer}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>Kilómetros</Label>
                  <Input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="Ej: 3 500"
                    value={odometerForm.odometer}
                    onChange={(e) => setOdometerForm((p) => ({ ...p, odometer: e.target.value }))}
                    required
                    disabled={isAddingOdometer}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Notas opcionales..."
                  value={odometerForm.notes}
                  onChange={(e) => setOdometerForm((p) => ({ ...p, notes: e.target.value }))}
                  disabled={isAddingOdometer}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="filled"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  disabled={isAddingOdometer || !odometerForm.odometer}
                >
                  {isAddingOdometer
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Plus className="w-3.5 h-3.5" />}
                  Guardar
                </Button>
              </div>
              {odometerError && (
                <p className="text-xs" style={{ color: "var(--md-error)" }}>{odometerError}</p>
              )}
            </form>
          </div>

          {/* Combined log list */}
          <OdometerLogList
            entries={allOdometerEntries}
            showAll={showAllOdometer}
            onToggleShowAll={() => setShowAllOdometer((v) => !v)}
          />
        </GlassCard>

        {/* Language and Units */}
        <GlassCard role="region" aria-labelledby="preferences-heading">
          <h2 id="preferences-heading" className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" aria-hidden="true" />
            Preferencias
          </h2>
          <div className="space-y-4">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "system", "dark"] as const).map((t) => {
                  const isActive = (settings.theme ?? "system") === t;
                  const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                  const label = t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema";
                  return (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-[var(--shape-md)] border text-xs font-medium transition-all"
                      style={{
                        background: isActive ? "var(--md-primary-container)" : "transparent",
                        borderColor: isActive ? "var(--md-primary)" : "var(--md-outline-variant)",
                        color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

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
