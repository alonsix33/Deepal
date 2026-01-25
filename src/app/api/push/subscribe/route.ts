import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json(
      { error: "Error subscribing to push notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return NextResponse.json(
      { error: "Error unsubscribing from push notifications" },
      { status: 500 }
    );
  }
}
