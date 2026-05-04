import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get odometer logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const limit = parseInt(searchParams.get("limit") || "30");

    const where: Record<string, unknown> = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const logs = await prisma.odometerLog.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching odometer logs:", error);
    return NextResponse.json(
      { error: "Error fetching odometer logs" },
      { status: 500 }
    );
  }
}

// POST - Create new odometer log (monthly registration)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    let vehicle = await prisma.vehicle.findFirst();
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          make: "Deepal",
          model: "S05",
          year: 2026,
          trim: "REEV",
          color: "Eclipse Black",
        },
      });
    }

    if (!data.odometer || data.odometer <= 0) {
      return NextResponse.json({ error: "El odómetro debe ser mayor a 0" }, { status: 400 });
    }

    const log = await prisma.odometerLog.create({
      data: {
        vehicleId: vehicle.id,
        odometer: data.odometer,
        batteryLevel: data.batteryLevel,
        notes: data.notes,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    // Find the current odometer from the most-recent-by-date entry across all
    // sources. Date is the primary indicator; numeric value breaks ties.
    const [latestLog, latestCharge, latestFuelUp, latestService] = await Promise.all([
      prisma.odometerLog.findFirst({ where: { vehicleId: vehicle.id }, orderBy: { date: "desc" } }),
      prisma.charge.findFirst({ where: { vehicleId: vehicle.id, odometerEnd: { gt: 0 } }, orderBy: { date: "desc" } }),
      prisma.fuelUp.findFirst({ where: { vehicleId: vehicle.id, odometer: { gt: 0 } }, orderBy: { date: "desc" } }),
      prisma.service.findFirst({ where: { vehicleId: vehicle.id, odometer: { gt: 0 } }, orderBy: { date: "desc" } }),
    ]);

    const candidates = [
      latestLog ? { date: latestLog.date, odometer: latestLog.odometer } : null,
      latestCharge ? { date: latestCharge.date, odometer: latestCharge.odometerEnd ?? 0 } : null,
      latestFuelUp ? { date: latestFuelUp.date, odometer: latestFuelUp.odometer } : null,
      latestService ? { date: latestService.date, odometer: latestService.odometer } : null,
    ].filter(Boolean) as { date: Date; odometer: number }[];

    candidates.sort((a, b) => {
      const dt = new Date(b.date).getTime() - new Date(a.date).getTime();
      return dt !== 0 ? dt : b.odometer - a.odometer;
    });

    const trueCurrentOdometer = candidates[0]?.odometer ?? vehicle.currentOdometer;

    if (trueCurrentOdometer !== vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: trueCurrentOdometer },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating odometer log:", error);
    return NextResponse.json(
      { error: "Error creating odometer log" },
      { status: 500 }
    );
  }
}

// GET last odometer registration date
export async function HEAD() {
  try {
    const lastLog = await prisma.odometerLog.findFirst({
      orderBy: { date: "desc" },
    });

    const headers = new Headers();
    if (lastLog) {
      headers.set("X-Last-Registration", lastLog.date.toISOString());
    }

    return new NextResponse(null, { status: 200, headers });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
