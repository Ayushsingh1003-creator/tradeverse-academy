import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ plan: "free", status: "inactive", isPremium: false });

  const subscription = await db.subscription.findUnique({ where: { clerkUserId: userId } });
  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "inactive";

  return NextResponse.json({
    plan,
    status,
    isPremium: plan !== "free" && ["active", "trialing"].includes(status),
  });
}
