import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get all charges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const charges = await prisma.charge.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(charges);
  } catch (error) {
    console.error("Error fetching charges:", error);
    return NextResponse.json(
      { error: "Error fetching charges" },
      { status: 500 }
    );
  }
}

// POST - Create new charge
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Ensure we have a vehicle
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

    const charge = await prisma.charge.create({
      data: {
        ...data,
        vehicleId: vehicle.id,
        date: new Date(data.date),
      },
    });

    // Update vehicle odometer if provided
    if (data.odometerEnd && data.odometerEnd > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: data.odometerEnd },
      });
    }

    return NextResponse.json(charge, { status: 201 });
  } catch (error) {
    console.error("Error creating charge:", error);
    return NextResponse.json(
      { error: "Error creating charge" },
      { status: 500 }
    );
  }
}
