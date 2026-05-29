import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db.subscription.findUnique({ where: { clerkUserId: userId } });
  if (!sub?.stripeCustomerId) return NextResponse.json({ error: "No customer found" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/settings`,
  });

  return NextResponse.json({ url: session.url });
}

