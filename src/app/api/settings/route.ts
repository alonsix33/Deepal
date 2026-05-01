import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get settings
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          currency: "PEN",
          units: "metric",
          language: "es",
          theme: "dark",
          notificationsEnabled: true,
          electricityRateKwh: 0.6861,
          batteryCapacity: 27.28,
          chargingEfficiency: 0.9,
        },
      });
    } else {
      // Migrate old defaults
      const updates: Record<string, unknown> = {};
      if (settings.electricityRateKwh === 0.73) updates.electricityRateKwh = 0.6861;
      if (settings.batteryCapacity == null) updates.batteryCapacity = 27.28;
      if (settings.chargingEfficiency == null) updates.chargingEfficiency = 0.9;
      if (Object.keys(updates).length > 0) {
        settings = await prisma.settings.update({
          where: { id: settings.id },
          data: updates,
        });
      }
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({ data });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    );
  }
}
