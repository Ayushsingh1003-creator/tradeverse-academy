import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Sign-in is unavailable in this environment" }, { status: 401 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { courseSlug?: string; returnUrl?: string };
  const courseSlug = String(body.courseSlug ?? "");
  const returnUrl = String(body.returnUrl ?? "");

  const courseRow = await db.liveCohort.findFirst({
    where: { slug: courseSlug, status: "published" },
  });
  if (!courseRow) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (!courseRow.stripePriceId) {
    return NextResponse.json({ error: "Enrollment is unavailable for this class" }, { status: 400 });
  }

  const user = await currentUser();
  const customer = await stripe.customers.create({
    email: user?.emailAddresses?.[0]?.emailAddress,
    metadata: { clerkUserId: userId, liveClassSlug: courseRow.slug },
  });

  const origin = returnUrl || req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    line_items: [{ price: courseRow.stripePriceId, quantity: 1 }],
    success_url: `${origin}/live-classes/${courseRow.slug}?enrolled=1`,
    cancel_url: `${origin}/live-classes/${courseRow.slug}?enrolled=0`,
    metadata: { clerkUserId: userId, liveClassSlug: courseRow.slug },
  });

  return NextResponse.json({ url: session.url });
}
