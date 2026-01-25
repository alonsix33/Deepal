import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get all fuel ups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    const where: Record<string, unknown> = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const fuelUps = await prisma.fuelUp.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(fuelUps);
  } catch (error) {
    console.error("Error fetching fuel ups:", error);
    return NextResponse.json(
      { error: "Error fetching fuel ups" },
      { status: 500 }
    );
  }
}

// POST - Create new fuel up
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

    const fuelUp = await prisma.fuelUp.create({
      data: {
        ...data,
        vehicleId: vehicle.id,
        date: new Date(data.date),
      },
    });

    // Update vehicle odometer
    if (data.odometer > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: data.odometer },
      });
    }

    return NextResponse.json(fuelUp, { status: 201 });
  } catch (error) {
    console.error("Error creating fuel up:", error);
    return NextResponse.json(
      { error: "Error creating fuel up" },
      { status: 500 }
    );
  }
}
