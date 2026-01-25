import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get or create vehicle
export async function GET() {
  try {
    let vehicle = await prisma.vehicle.findFirst();

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          make: "Deepal",
          model: "S05",
          year: 2026,
          trim: "REEV",
          color: "Eclipse Black",
          purchaseDate: new Date("2026-01-20"),
          odometerStart: 0,
          currentOdometer: 0,
        },
      });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error fetching vehicle" },
      { status: 500 }
    );
  }
}

// PATCH - Update vehicle
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    let vehicle = await prisma.vehicle.findFirst();

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({ data });
    } else {
      vehicle = await prisma.vehicle.update({
        where: { id: vehicle.id },
        data,
      });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Error updating vehicle" },
      { status: 500 }
    );
  }
}
