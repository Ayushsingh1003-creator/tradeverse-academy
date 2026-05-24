import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@tradeverse.io";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

/** Call from cron jobs with header `x-tradeverse-cron: CRON_SECRET` */
export async function POST(request: Request) {
  const cron = request.headers.get("x-tradeverse-cron");
  const secret = process.env.CRON_SECRET;
  if (!secret || cron !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!configureWebPush()) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { title?: string; body?: string; clerkUserId?: string; broadcast?: boolean };
  const title = body.title ?? "Tradeverse Academy";
  const text = body.body ?? "";
  const payload = JSON.stringify({ title, body: text });

  const targets =
    body.broadcast === true
      ? await db.pushSubscription.findMany()
      : body.clerkUserId
        ? await db.pushSubscription.findMany({ where: { clerkUserId: body.clerkUserId } })
        : [];

  if (!targets.length) {
    return NextResponse.json({ sent: 0, message: "No subscriptions" });
  }

  let sent = 0;
  for (const sub of targets) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent += 1;
    } catch {
      await db.pushSubscription.deleteMany({ where: { id: sub.id } }).catch(() => {});
    }
  }

  return NextResponse.json({ sent });
}
