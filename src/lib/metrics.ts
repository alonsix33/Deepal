import type { Charge, Settings } from "@/types";

export interface EcoMetrics {
  estimatedElectricKm: number;
  savedVsGasolinePEN: number;
  co2AvoidedKg: number;
  equivalentTrees: number;
  avgCostPerKwh: number;
  totalKwhCharged: number;
  totalChargingCostOnly: number;
}

export function computeEcoMetrics(charges: Charge[], settings: Settings): EcoMetrics {
  const {
    chargingEfficiency,
    gasolineRefConsumptionL100km,
    gasolinePricePEN,
    co2GridIntensityGkwh,
    evConsumptionKwh100km,
  } = settings;

  const totalKwhCharged = charges.reduce((s, c) => s + c.kwhCharged, 0);
  const totalChargingCostOnly = charges.reduce((s, c) => s + c.totalCost - c.parkingCostPEN, 0);

  // Net kWh delivered to motor after charging losses
  const kwhNet = totalKwhCharged * chargingEfficiency;

  // Estimated electric km driven (based on S05 consumption)
  const estimatedElectricKm =
    evConsumptionKwh100km > 0 ? kwhNet / (evConsumptionKwh100km / 100) : 0;

  // What those km would have cost in gasoline with a reference SUV
  const gasolineCostEqPEN =
    estimatedElectricKm * (gasolineRefConsumptionL100km / 100) * gasolinePricePEN;

  const savedVsGasolinePEN = gasolineCostEqPEN - totalChargingCostOnly;

  // CO2: grid emissions vs gasoline equivalent (2.31 kg CO2/L)
  const co2FromGridKg = totalKwhCharged * (co2GridIntensityGkwh / 1000);
  const co2IfGasolineKg =
    estimatedElectricKm * (gasolineRefConsumptionL100km / 100) * 2.31;
  const co2AvoidedKg = Math.max(0, co2IfGasolineKg - co2FromGridKg);

  // Trees: 1 adult tree absorbs ~22 kg CO2/year
  const equivalentTrees = co2AvoidedKg / 22;

  const avgCostPerKwh = totalKwhCharged > 0 ? totalChargingCostOnly / totalKwhCharged : 0;

  return {
    estimatedElectricKm,
    savedVsGasolinePEN,
    co2AvoidedKg,
    equivalentTrees,
    avgCostPerKwh,
    totalKwhCharged,
    totalChargingCostOnly,
  };
}

export interface MonthlySavingsPoint {
  month: string;
  monthlySavings: number;
  cumulativeSavings: number;
  co2Avoided: number;
  sortKey: number;
}

export function computeMonthlySavings(
  charges: Charge[],
  settings: Settings
): MonthlySavingsPoint[] {
  const {
    chargingEfficiency,
    gasolineRefConsumptionL100km,
    gasolinePricePEN,
    co2GridIntensityGkwh,
    evConsumptionKwh100km,
  } = settings;

  const months: Record<
    string,
    { month: string; savings: number; co2Avoided: number; sortKey: number }
  > = {};

  charges.forEach((c) => {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!months[key]) {
      months[key] = {
        month: d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" }),
        savings: 0,
        co2Avoided: 0,
        sortKey: d.getFullYear() * 100 + d.getMonth(),
      };
    }
    const kwhNet = c.kwhCharged * chargingEfficiency;
    const estKm = evConsumptionKwh100km > 0 ? kwhNet / (evConsumptionKwh100km / 100) : 0;
    const gasCost = estKm * (gasolineRefConsumptionL100km / 100) * gasolinePricePEN;
    const chargeCost = c.totalCost - c.parkingCostPEN;
    months[key].savings += gasCost - chargeCost;

    const co2Grid = c.kwhCharged * (co2GridIntensityGkwh / 1000);
    const co2Gas = estKm * (gasolineRefConsumptionL100km / 100) * 2.31;
    months[key].co2Avoided += Math.max(0, co2Gas - co2Grid);
  });

  const sorted = Object.values(months).sort((a, b) => a.sortKey - b.sortKey);
  let cumulative = 0;
  return sorted.map(({ month, savings, co2Avoided, sortKey }) => {
    cumulative += savings;
    return { month, monthlySavings: savings, cumulativeSavings: cumulative, co2Avoided, sortKey };
  });
}
