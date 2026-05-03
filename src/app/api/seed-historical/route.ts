import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// One-time seed endpoint for historical charges (Feb–Apr 2026).
// Protected by a secret token: GET /api/seed-historical?token=deepal2026seed
// Safe to call multiple times — skips insert if charges already exist.

const SEED_TOKEN = "deepal2026seed";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== SEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Guard: skip if charges already exist
  const existing = await prisma.charge.count();
  if (existing > 0) {
    return NextResponse.json({
      skipped: true,
      message: `Ya existen ${existing} cargas. No se insertó nada.`,
      existing,
    });
  }

  // Get or create vehicle
  let vehicle = await prisma.vehicle.findFirst();
  if (!vehicle) {
    return NextResponse.json(
      { error: "No se encontró vehículo. Abre la app primero." },
      { status: 400 }
    );
  }

  const vid = vehicle.id;
  const now = new Date();

  const charges = await prisma.charge.createMany({
    data: [
      // ── La Rambla San Borja — Sábados, AC 7kW, carga gratis ─────────────
      // 3 primeras visitas: parking S/ 7 (3h exactas)
      {
        vehicleId: vid,
        date: new Date("2026-02-21T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 7.0,
        totalCost: 7.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        vehicleId: vid,
        date: new Date("2026-02-28T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 7.0,
        totalCost: 7.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        vehicleId: vid,
        date: new Date("2026-03-07T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 7.0,
        totalCost: 7.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      // 3 visitas siguientes: parking variable
      {
        vehicleId: vid,
        date: new Date("2026-03-14T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 14.0,
        totalCost: 14.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        vehicleId: vid,
        date: new Date("2026-03-21T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 17.0,
        totalCost: 17.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        vehicleId: vid,
        date: new Date("2026-04-04T16:00:00Z"),
        location: "la_rambla",
        chargeType: "AC_7kW",
        batteryStartPercent: 20,
        batteryEndPercent: 90,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: true,
        parkingCostPEN: 21.0,
        totalCost: 21.0,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 180,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      // ── Repsol — DC rápida (viernes 18 abr) ─────────────────────────────
      // 30→80%, S/ 1.99/kWh, total S/ 29.85 = 15.0 kWh exactos
      {
        vehicleId: vid,
        date: new Date("2026-04-18T19:00:00Z"),
        location: "other",
        chargeType: "DC_50kW",
        batteryStartPercent: 30,
        batteryEndPercent: 80,
        kwhCharged: 15.0,
        kwhRate: 1.99,
        isFree: false,
        parkingCostPEN: 0.0,
        totalCost: 29.85,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 20,
        notes: "Repsol",
        createdAt: now,
        updatedAt: now,
      },
      // ── Casa (AC 7kW, tarifa S/ 0.6861/kWh) ─────────────────────────────
      // 11 abr: 30→100% → 19.096 kWh netos → costo S/ 14.56
      {
        vehicleId: vid,
        date: new Date("2026-04-11T23:00:00Z"),
        location: "home",
        chargeType: "AC_7kW",
        batteryStartPercent: 30,
        batteryEndPercent: 100,
        kwhCharged: 19.096,
        kwhRate: null,
        isFree: false,
        parkingCostPEN: 0.0,
        totalCost: 14.56,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 182,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
      // 25 abr: 60→100% → 10.912 kWh netos → costo S/ 8.32
      {
        vehicleId: vid,
        date: new Date("2026-04-25T23:00:00Z"),
        location: "home",
        chargeType: "AC_7kW",
        batteryStartPercent: 60,
        batteryEndPercent: 100,
        kwhCharged: 10.912,
        kwhRate: null,
        isFree: false,
        parkingCostPEN: 0.0,
        totalCost: 8.32,
        odometerStart: null,
        odometerEnd: null,
        durationMinutes: 104,
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });

  return NextResponse.json({
    success: true,
    inserted: charges.count,
    message: `✓ ${charges.count} cargas históricas insertadas correctamente.`,
    vehicleId: vid,
  });
}
