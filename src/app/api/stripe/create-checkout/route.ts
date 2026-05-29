import { requireDbUser } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { authUserId: userId, dbUser } = authResult;

  const body = await req.json();
  const { priceId, returnUrl } = body as { priceId: string; returnUrl: string };

  const existing = await db.subscription.findUnique({ where: { clerkUserId: userId } });
  let customerId = existing?.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { authUserId: userId },
    });
    customerId = customer.id;
    await db.subscription.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId, stripeCustomerId: customerId, plan: "free", status: "inactive" },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}/premium/success`,
    cancel_url: `${returnUrl}/pricing`,
    metadata: { authUserId: userId, clerkUserId: userId },
  });

  return NextResponse.json({ url: session.url });
}

