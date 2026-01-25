import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get single charge
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const charge = await prisma.charge.findUnique({
      where: { id },
    });

    if (!charge) {
      return NextResponse.json({ error: "Charge not found" }, { status: 404 });
    }

    return NextResponse.json(charge);
  } catch (error) {
    console.error("Error fetching charge:", error);
    return NextResponse.json(
      { error: "Error fetching charge" },
      { status: 500 }
    );
  }
}

// PATCH - Update charge
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const charge = await prisma.charge.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    return NextResponse.json(charge);
  } catch (error) {
    console.error("Error updating charge:", error);
    return NextResponse.json(
      { error: "Error updating charge" },
      { status: 500 }
    );
  }
}

// DELETE - Delete charge
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.charge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting charge:", error);
    return NextResponse.json(
      { error: "Error deleting charge" },
      { status: 500 }
    );
  }
}
