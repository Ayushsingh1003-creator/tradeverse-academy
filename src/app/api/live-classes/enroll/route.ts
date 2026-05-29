import { requireDbUser } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Sign-in is unavailable in this environment" }, { status: 401 });
  }

  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { authUserId: userId, dbUser } = authResult;

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

  const customer = await stripe.customers.create({
    email: dbUser.email,
    metadata: { authUserId: userId, liveClassSlug: courseRow.slug },
  });

  const origin = returnUrl || req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    line_items: [{ price: courseRow.stripePriceId, quantity: 1 }],
    success_url: `${origin}/live-classes/${courseRow.slug}?enrolled=1`,
    cancel_url: `${origin}/live-classes/${courseRow.slug}?enrolled=0`,
    metadata: { authUserId: userId, liveClassSlug: courseRow.slug },
  });

  return NextResponse.json({ url: session.url });
}
