import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const monthlyPrice = process.env.STRIPE_MONTHLY_PRICE_ID;
const annualPrice = process.env.STRIPE_ANNUAL_PRICE_ID;

function mapPlan(priceId?: string | null) {
  if (priceId === annualPrice) return "annual";
  if (priceId === monthlyPrice) return "monthly";
  return "free";
}

export async function POST(req: Request) {
  const signature = (await headers()).get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature", detail: String(error) }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const authUserId = session.metadata?.authUserId ?? session.metadata?.clerkUserId;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    if (authUserId) {
      const subscription = subscriptionId ? (await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription) : null;
      const priceId = subscription?.items.data[0]?.price.id ?? null;
      await db.subscription.upsert({
        where: { clerkUserId: authUserId },
        create: {
          clerkUserId: authUserId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan: mapPlan(priceId),
          status: "active",
          currentPeriodEnd: null,
        },
        update: {
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan: mapPlan(priceId),
          status: "active",
          currentPeriodEnd: null,
        },
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : null;
    if (customerId) {
      await db.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id,
          plan: mapPlan(sub.items.data[0]?.price.id),
          status: sub.status,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : null;
    if (customerId) {
      await db.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: "free", status: "inactive", stripeSubscriptionId: null, stripePriceId: null, cancelAtPeriodEnd: false },
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
    if (customerId) {
      await db.subscription.updateMany({ where: { stripeCustomerId: customerId }, data: { status: "past_due" } });
    }
  }

  return NextResponse.json({ received: true });
}
