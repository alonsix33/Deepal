import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns today's date as "YYYY-MM-DD" in the user's local timezone.
// new Date().toISOString() returns UTC, which is wrong for users behind UTC
// (e.g. Peru UTC-5: 8 PM on May 10 → ISO gives "2026-05-11").
export function todayLocalISO(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatCurrency(amount: number, currency: string = "PEN"): string {
  if (currency === "PEN") {
    return `S/ ${amount.toFixed(2)}`;
  }
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("es-PE")} km`;
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}

export function formatLiters(liters: number): string {
  return `${liters.toFixed(2)} L`;
}

export function calculateCostPerKm(totalCost: number, totalKm: number): number {
  if (totalKm === 0) return 0;
  return totalCost / totalKm;
}

export function calculateElectricEfficiency(kwh: number, km: number): number {
  if (km === 0) return 0;
  return (kwh / km) * 100; // kWh/100km
}

export function calculateFuelEfficiency(liters: number, km: number): number {
  if (km === 0) return 0;
  return (liters / km) * 100; // L/100km
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
