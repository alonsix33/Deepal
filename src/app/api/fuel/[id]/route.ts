import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get single fuel up
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const fuelUp = await prisma.fuelUp.findUnique({
      where: { id },
    });

    if (!fuelUp) {
      return NextResponse.json({ error: "Fuel up not found" }, { status: 404 });
    }

    return NextResponse.json(fuelUp);
  } catch (error) {
    console.error("Error fetching fuel up:", error);
    return NextResponse.json(
      { error: "Error fetching fuel up" },
      { status: 500 }
    );
  }
}

// PATCH - Update fuel up
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const fuelUp = await prisma.fuelUp.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    return NextResponse.json(fuelUp);
  } catch (error) {
    console.error("Error updating fuel up:", error);
    return NextResponse.json(
      { error: "Error updating fuel up" },
      { status: 500 }
    );
  }
}

// DELETE - Delete fuel up
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.fuelUp.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fuel up:", error);
    return NextResponse.json(
      { error: "Error deleting fuel up" },
      { status: 500 }
    );
  }
}
