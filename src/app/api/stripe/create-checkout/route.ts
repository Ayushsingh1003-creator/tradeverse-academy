import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { priceId, returnUrl } = body as { priceId: string; returnUrl: string };

  const existing = await db.subscription.findUnique({ where: { clerkUserId: userId } });
  let customerId = existing?.stripeCustomerId ?? null;

  if (!customerId) {
    const user = await currentUser();
    const customer = await stripe.customers.create({
      email: user?.emailAddresses?.[0]?.emailAddress,
      metadata: { clerkUserId: userId },
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
    metadata: { clerkUserId: userId },
  });

  return NextResponse.json({ url: session.url });
}
