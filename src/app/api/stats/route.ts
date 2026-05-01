import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vehicle = await prisma.vehicle.findFirst();
    if (!vehicle) {
      return NextResponse.json({
        totalKmDriven: 0,
        totalChargeCost: 0,
        totalParkingCost: 0,
        totalFuelCost: 0,
        totalMaintenanceCost: 0,
        electricUsagePercent: 100,
        averageCostPerKm: 0,
        nextServiceKm: 0,
        estimatedRange: 109,
      });
    }

    const [charges, fuelUps, services, settings] = await Promise.all([
      prisma.charge.findMany(),
      prisma.fuelUp.findMany(),
      prisma.service.findMany(),
      prisma.settings.findFirst(),
    ]);

    const totalKmDriven = vehicle.currentOdometer - vehicle.odometerStart;
    const totalChargeCost = charges.reduce((sum, c) => sum + c.totalCost, 0);
    const totalParkingCost = charges.reduce((sum, c) => sum + c.parkingCostPEN, 0);
    const totalFuelCost = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);
    const totalMaintenanceCost = services.reduce((sum, s) => sum + s.costPEN, 0);

    const totalEnergyCost = totalChargeCost + totalFuelCost;
    const electricUsagePercent =
      totalEnergyCost > 0
        ? Math.round((totalChargeCost / totalEnergyCost) * 100)
        : 100;

    const averageCostPerKm =
      totalKmDriven > 0 ? totalEnergyCost / totalKmDriven : 0;

    const lastService = services
      .filter((s) => s.serviceType.toLowerCase().includes("servicio"))
      .sort((a, b) => b.odometer - a.odometer)[0];
    const lastServiceKm = lastService?.odometer || 0;
    const nextServiceKm = Math.max(
      0,
      Math.ceil((lastServiceKm + 1) / 10000) * 10000 -
        vehicle.currentOdometer
    );

    return NextResponse.json({
      totalKmDriven,
      totalChargeCost,
      totalParkingCost,
      totalFuelCost,
      totalMaintenanceCost,
      electricUsagePercent: Math.round(electricUsagePercent * 100) / 100,
      averageCostPerKm: Math.round(averageCostPerKm * 100) / 100,
      nextServiceKm,
      currentOdometer: vehicle.currentOdometer,
      totalCharges: charges.length,
      totalFuelUps: fuelUps.length,
      totalServices: services.length,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
