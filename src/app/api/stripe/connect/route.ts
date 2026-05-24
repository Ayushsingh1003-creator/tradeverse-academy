import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Stripe Connect onboarding URL — wire Stripe Account Links in production */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountId = process.env.STRIPE_CONNECT_ACCOUNT_ID;
  if (!accountId) {
    return NextResponse.json({
      message: "Set STRIPE_CONNECT_ACCOUNT_ID or implement Account Links with Stripe SDK.",
      onboardingUrl: "https://dashboard.stripe.com/connect/accounts/overview",
    });
  }

  return NextResponse.json({ onboardingUrl: `https://connect.stripe.com/express/oauth/authorize?client_id=${accountId}` });
}
