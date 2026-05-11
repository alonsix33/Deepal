import type { Charge, FuelUp, Settings } from "@/types";

export interface EcoMetrics {
  estimatedElectricKm: number;
  savedVsGasolinePEN: number;
  co2AvoidedKg: number;
  co2IfGasolineKg: number;
  co2FromGridKg: number;
  equivalentTrees: number;
  avgCostPerKwh: number;
  totalKwhCharged: number;
  totalChargingCostOnly: number;
  effectiveGasolinePricePEN: number;
}

// Weighted average price per litre from actual fuelUp records.
// Falls back to the manual setting when no records exist.
export function computeEffectiveGasolinePricePEN(
  fuelUps: FuelUp[],
  fallbackPricePEN: number
): number {
  const totalCostPEN = fuelUps.reduce((s, f) => s + f.costPEN, 0);
  const totalLitres = fuelUps.reduce((s, f) => s + f.gallons * 3.785411784, 0);
  return totalLitres > 0 ? totalCostPEN / totalLitres : fallbackPricePEN;
}

export function computeEcoMetrics(
  charges: Charge[],
  fuelUps: FuelUp[],
  settings: Settings
): EcoMetrics {
  const {
    chargingEfficiency,
    gasolineRefConsumptionL100km,
    gasolinePricePEN,
    co2GridIntensityGkwh,
    evConsumptionKwh100km,
  } = settings;

  const effectiveGasolinePricePEN = computeEffectiveGasolinePricePEN(fuelUps, gasolinePricePEN);

  const totalKwhCharged = charges.reduce((s, c) => s + c.kwhCharged, 0);
  // Total cost includes parking — parking paid at a "free" charger is still
  // part of the real cost of that charging session.
  const totalChargingCostOnly = charges.reduce((s, c) => s + c.totalCost, 0);

  // Net kWh delivered to motor after charging losses
  const kwhNet = totalKwhCharged * chargingEfficiency;

  // Estimated electric km driven (based on S05 consumption)
  const estimatedElectricKm =
    evConsumptionKwh100km > 0 ? kwhNet / (evConsumptionKwh100km / 100) : 0;

  // What those km would have cost in gasoline with a reference SUV
  const gasolineCostEqPEN =
    estimatedElectricKm * (gasolineRefConsumptionL100km / 100) * effectiveGasolinePricePEN;

  const savedVsGasolinePEN = gasolineCostEqPEN - totalChargingCostOnly;

  // CO2: grid emissions vs gasoline equivalent (2.31 kg CO2/L)
  const co2FromGridKg = totalKwhCharged * (co2GridIntensityGkwh / 1000);
  const co2IfGasolineKg = estimatedElectricKm * (gasolineRefConsumptionL100km / 100) * 2.31;
  const co2AvoidedKg = Math.max(0, co2IfGasolineKg - co2FromGridKg);

  // Trees: 1 adult tree absorbs ~22 kg CO2/year
  const equivalentTrees = co2AvoidedKg / 22;

  const avgCostPerKwh = totalKwhCharged > 0 ? totalChargingCostOnly / totalKwhCharged : 0;

  return {
    estimatedElectricKm,
    savedVsGasolinePEN,
    co2AvoidedKg,
    co2IfGasolineKg,
    co2FromGridKg,
    equivalentTrees,
    avgCostPerKwh,
    totalKwhCharged,
    totalChargingCostOnly,
    effectiveGasolinePricePEN,
  };
}

export interface MonthlySavingsPoint {
  month: string;
  monthlySavings: number;
  cumulativeSavings: number;
  co2Avoided: number;
}

export function computeMonthlySavings(
  charges: Charge[],
  fuelUps: FuelUp[],
  settings: Settings
): MonthlySavingsPoint[] {
  const {
    chargingEfficiency,
    gasolineRefConsumptionL100km,
    gasolinePricePEN,
    co2GridIntensityGkwh,
    evConsumptionKwh100km,
  } = settings;

  const effectiveGasolinePricePEN = computeEffectiveGasolinePricePEN(fuelUps, gasolinePricePEN);

  // Use string slicing on "YYYY-MM-DD" to avoid UTC-vs-local timezone issues
  const months: Record<
    string,
    { month: string; savings: number; co2Avoided: number }
  > = {};

  charges.forEach((c) => {
    const yearMonth = c.date.slice(0, 7); // "YYYY-MM"
    const year = parseInt(c.date.slice(0, 4), 10);
    const monthIdx = parseInt(c.date.slice(5, 7), 10) - 1; // 0-based
    if (!months[yearMonth]) {
      const label = new Date(year, monthIdx, 1).toLocaleDateString("es-PE", {
        month: "short",
        year: "2-digit",
      });
      months[yearMonth] = { month: label, savings: 0, co2Avoided: 0 };
    }
    const kwhNet = c.kwhCharged * chargingEfficiency;
    const estKm = evConsumptionKwh100km > 0 ? kwhNet / (evConsumptionKwh100km / 100) : 0;
    const gasCost = estKm * (gasolineRefConsumptionL100km / 100) * effectiveGasolinePricePEN;
    months[yearMonth].savings += gasCost - c.totalCost;

    const co2Grid = c.kwhCharged * (co2GridIntensityGkwh / 1000);
    const co2Gas = estKm * (gasolineRefConsumptionL100km / 100) * 2.31;
    months[yearMonth].co2Avoided += Math.max(0, co2Gas - co2Grid);
  });

  const sorted = Object.keys(months).sort().map((k) => months[k]);
  let cumulative = 0;
  return sorted.map(({ month, savings, co2Avoided }) => {
    cumulative += savings;
    return { month, monthlySavings: savings, cumulativeSavings: cumulative, co2Avoided };
  });
}
