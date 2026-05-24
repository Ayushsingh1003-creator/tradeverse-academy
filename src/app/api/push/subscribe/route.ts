import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const authKey = body.keys?.auth;
  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { clerkUserId: userId, endpoint, p256dh, auth: authKey },
    update: { clerkUserId: userId, p256dh, auth: authKey },
  });

  return NextResponse.json({ ok: true });
}
