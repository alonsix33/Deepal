import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    const where: Record<string, unknown> = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Error fetching services" },
      { status: 500 }
    );
  }
}

// POST - Create new service
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

    const service = await prisma.service.create({
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

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Error creating service" },
      { status: 500 }
    );
  }
}
