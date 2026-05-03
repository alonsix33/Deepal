import type { Charge, FuelUp, OdometerLog, Service, Vehicle } from "@/types";

export interface ServiceProjection {
  nextServiceKm: number;
  kmRemaining: number;
  kmPerDayEwma: number;
  kmPerDayP25: number;
  kmPerDayP75: number;
  expectedDate: Date | null;
  earlyDate: Date | null;
  lateDate: Date | null;
  confidence: "high" | "medium" | "low" | "none";
  dataPoints: number;
  windowDays: number;
  isOverdue: boolean;
}

interface OdometerEvent {
  date: Date;
  odometer: number;
}

const EWMA_ALPHA = 0.35;
const MAX_PROJECTION_DAYS = 730;

// Option B schedule: 5k → 10k → 20k → 30k → 40k → ...
export function getNextServiceMilestone(currentOdometer: number): number {
  if (currentOdometer < 5_000) return 5_000;
  if (currentOdometer < 10_000) return 10_000;
  return Math.ceil((currentOdometer + 1) / 10_000) * 10_000;
}

export function getAllServiceMilestones(upToKm: number): number[] {
  const milestones = [5_000, 10_000];
  let next = 20_000;
  while (next <= upToKm) {
    milestones.push(next);
    next += 10_000;
  }
  return milestones;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function applyEwma(rates: number[], alpha: number): number {
  if (rates.length === 0) return 0;
  // Apply oldest → newest; recent values get more weight
  let ewma = rates[0];
  for (let i = 1; i < rates.length; i++) {
    ewma = alpha * rates[i] + (1 - alpha) * ewma;
  }
  return ewma;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days));
  return d;
}

export function formatProjectionDate(date: Date): string {
  return date.toLocaleDateString("es-PE", { month: "short", year: "numeric" });
}

export function computeServiceProjection(
  vehicle: Vehicle,
  charges: Charge[],
  fuelUps: FuelUp[],
  services: Service[],
  odometerLogs?: OdometerLog[]
): ServiceProjection {
  const current = vehicle.currentOdometer;
  const nextServiceKm = getNextServiceMilestone(current);
  const kmRemaining = Math.max(0, nextServiceKm - current);
  const isOverdue = current >= nextServiceKm;

  // Collect all (date, odometer) pairs — charges are primary source
  const events: OdometerEvent[] = [];

  for (const c of charges) {
    if (c.odometerEnd != null && c.odometerEnd > 0) {
      events.push({ date: new Date(c.date), odometer: c.odometerEnd });
    }
  }
  for (const f of fuelUps) {
    if (f.odometer > 0) {
      events.push({ date: new Date(f.date), odometer: f.odometer });
    }
  }
  for (const s of services) {
    if (s.odometer > 0) {
      events.push({ date: new Date(s.date), odometer: s.odometer });
    }
  }
  if (odometerLogs) {
    for (const l of odometerLogs) {
      if (l.odometer > 0) {
        events.push({ date: new Date(l.date), odometer: l.odometer });
      }
    }
  }

  // Add vehicle start as initial anchor
  if (vehicle.odometerStart >= 0) {
    events.push({
      date: new Date(vehicle.purchaseDate),
      odometer: vehicle.odometerStart,
    });
  }

  // Sort chronologically, deduplicate same-date same-odometer
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  const unique = events.filter(
    (e, i) =>
      i === 0 ||
      e.date.getTime() !== events[i - 1].date.getTime() ||
      e.odometer !== events[i - 1].odometer
  );

  const none: ServiceProjection = {
    nextServiceKm,
    kmRemaining,
    kmPerDayEwma: 0,
    kmPerDayP25: 0,
    kmPerDayP75: 0,
    expectedDate: null,
    earlyDate: null,
    lateDate: null,
    confidence: "none",
    dataPoints: unique.length,
    windowDays: 0,
    isOverdue,
  };

  if (unique.length < 2) return none;

  // Compute km/day rates between consecutive events
  const rates: number[] = [];
  for (let i = 1; i < unique.length; i++) {
    const days =
      (unique[i].date.getTime() - unique[i - 1].date.getTime()) / 86_400_000;
    const km = unique[i].odometer - unique[i - 1].odometer;
    if (days > 0 && km >= 0) {
      rates.push(km / days);
    }
  }

  if (rates.length === 0) return none;

  const now = new Date();
  const windowDays =
    (unique[unique.length - 1].date.getTime() - unique[0].date.getTime()) /
    86_400_000;

  // Confidence: based on density of recent data
  const ms60 = now.getTime() - 60 * 86_400_000;
  const ms90 = now.getTime() - 90 * 86_400_000;
  const recent60 = unique.filter((e) => e.date.getTime() >= ms60).length;
  const recent90 = unique.filter((e) => e.date.getTime() >= ms90).length;

  let confidence: ServiceProjection["confidence"];
  if (recent60 >= 5) confidence = "high";
  else if (recent90 >= 3 || unique.length >= 6) confidence = "medium";
  else confidence = "low";

  const ewmaRate = applyEwma(rates, EWMA_ALPHA);
  const p25 = percentile(rates, 25);
  const p75 = percentile(rates, 75);

  const toDate = (rate: number): Date | null => {
    if (rate <= 0 || kmRemaining === 0) return null;
    const days = kmRemaining / rate;
    if (days > MAX_PROJECTION_DAYS) return null;
    return addDays(now, days);
  };

  return {
    nextServiceKm,
    kmRemaining,
    kmPerDayEwma: Math.round(ewmaRate * 10) / 10,
    kmPerDayP25: Math.round(p25 * 10) / 10,
    kmPerDayP75: Math.round(p75 * 10) / 10,
    expectedDate: toDate(ewmaRate),
    earlyDate: toDate(p75),
    lateDate: toDate(p25),
    confidence,
    dataPoints: unique.length,
    windowDays: Math.round(windowDays),
    isOverdue,
  };
}
