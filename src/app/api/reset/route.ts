import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Reset all data (delete all records)
export async function POST() {
  try {
    // Delete all records in order (to respect foreign key constraints)
    await prisma.$transaction([
      prisma.odometerLog.deleteMany(),
      prisma.charge.deleteMany(),
      prisma.fuelUp.deleteMany(),
      prisma.service.deleteMany(),
      prisma.pushSubscription.deleteMany(),
      prisma.settings.deleteMany(),
      prisma.vehicle.deleteMany(),
    ]);

    return NextResponse.json({
      success: true,
      message: "All data has been reset",
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "Error resetting data" },
      { status: 500 }
    );
  }
}
