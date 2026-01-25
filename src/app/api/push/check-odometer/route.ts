import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@deepal-tracker.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// GET - Check if odometer reminder is needed (called by cron)
export async function GET() {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 }
      );
    }

    // Check last odometer registration
    const lastLog = await prisma.odometerLog.findFirst({
      orderBy: { date: "desc" },
    });

    const settings = await prisma.settings.findFirst();

    // If notifications are disabled, skip
    if (settings && !settings.notificationsEnabled) {
      return NextResponse.json({ skipped: true, reason: "notifications_disabled" });
    }

    // Check if we need to send reminder (no registration in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (!lastLog || lastLog.date < thirtyDaysAgo) {
      // Check if we already sent a reminder this week
      if (settings?.lastOdometerReminder) {
        const lastReminder = new Date(settings.lastOdometerReminder);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (lastReminder > sevenDaysAgo) {
          return NextResponse.json({
            skipped: true,
            reason: "reminder_sent_recently",
          });
        }
      }

      // Send reminder to all subscribers
      const subscriptions = await prisma.pushSubscription.findMany();

      if (subscriptions.length === 0) {
        return NextResponse.json({ skipped: true, reason: "no_subscribers" });
      }

      const daysSinceLastLog = lastLog
        ? Math.floor((Date.now() - lastLog.date.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const payload = JSON.stringify({
        title: "Recordatorio de Kilometraje",
        body: lastLog
          ? `Han pasado ${daysSinceLastLog} dias desde tu ultimo registro. Registra tu kilometraje actual.`
          : "No has registrado tu kilometraje este mes. Registra tu kilometraje actual.",
        icon: "/icons/icon.svg",
        badge: "/icons/icon.svg",
        data: {
          type: "odometer_reminder",
          url: "/",
        },
      });

      let sent = 0;
      for (const sub of subscriptions) {
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
          sent++;
        } catch (error) {
          // If subscription is invalid, remove it
          if ((error as { statusCode?: number }).statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint },
            });
          }
        }
      }

      // Update last reminder date
      if (settings) {
        await prisma.settings.update({
          where: { id: settings.id },
          data: { lastOdometerReminder: new Date() },
        });
      }

      return NextResponse.json({
        sent,
        total: subscriptions.length,
        reminder: "odometer",
      });
    }

    return NextResponse.json({
      skipped: true,
      reason: "recent_registration_exists",
      lastLogDate: lastLog.date,
    });
  } catch (error) {
    console.error("Error checking odometer reminder:", error);
    return NextResponse.json(
      { error: "Error checking odometer reminder" },
      { status: 500 }
    );
  }
}
