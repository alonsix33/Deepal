export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
  vin?: string;
  purchaseDate: string;
  purchasePrice: number;
  odometerStart: number;
  currentOdometer: number;
}

export interface Charge {
  id: string;
  vehicleId: string;
  date: string;
  location: string;
  chargeType: "AC_7kW" | "AC_22kW" | "DC_50kW";
  odometerStart?: number;
  odometerEnd?: number;
  kwhCharged: number;
  costPEN: number;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelUp {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  liters: number;
  costPEN: number;
  costPerLiter: number;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  serviceType: string;
  costPEN: number;
  provider?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  date: string;
  startOdometer: number;
  endOdometer: number;
  distance: number;
  purpose: "work" | "personal" | "weekend";
  mode: "electric" | "reev" | "mixed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  currency: string;
  units: "metric" | "imperial";
  language: "es" | "en";
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  electricityRateKwh: number;
}

export interface DashboardStats {
  totalKmDriven: number;
  totalChargeCost: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  electricUsagePercent: number;
  averageCostPerKm: number;
  nextServiceKm: number;
  currentBatteryLevel: number;
  estimatedRange: number;
}

export type ChargeLocation =
  | "home"
  | "jockey_plaza"
  | "larcomar"
  | "real_plaza"
  | "other";

export const CHARGE_LOCATIONS: Record<ChargeLocation, string> = {
  home: "Casa",
  jockey_plaza: "Jockey Plaza",
  larcomar: "Larcomar",
  real_plaza: "Real Plaza Salaverry",
  other: "Otro",
};

export const CHARGE_TYPES: Record<Charge["chargeType"], string> = {
  AC_7kW: "AC 7kW (Casa)",
  AC_22kW: "AC 22kW (Rápido)",
  DC_50kW: "DC 50kW+ (Ultra Rápido)",
};

export const SERVICE_TYPES = [
  "Primer servicio (5,000 km)",
  "Segundo servicio (15,000 km)",
  "Tercer servicio (25,000 km)",
  "Servicio mayor (40,000 km)",
  "Cambio de aceite",
  "Rotación de llantas",
  "Frenos",
  "Batería 12V",
  "Revisión general",
  "Otro",
];

export const TRIP_PURPOSES: Record<Trip["purpose"], string> = {
  work: "Trabajo",
  personal: "Personal",
  weekend: "Fin de semana",
};

export const TRIP_MODES: Record<Trip["mode"], string> = {
  electric: "Eléctrico",
  reev: "REEV (Generador)",
  mixed: "Mixto",
};
