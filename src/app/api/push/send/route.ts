import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@deepal-tracker.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// POST - Send push notification to all subscribers
export async function POST(request: NextRequest) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 }
      );
    }

    const { title, body, icon, data } = await request.json();

    const subscriptions = await prisma.pushSubscription.findMany();

    const payload = JSON.stringify({
      title: title || "Deepal S05 Tracker",
      body: body || "Tienes una notificacion",
      icon: icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: data || {},
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          // If subscription is invalid, remove it
          if ((error as { statusCode?: number }).statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint },
            });
          }
          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { success: boolean }).success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Error sending push notification" },
      { status: 500 }
    );
  }
}
