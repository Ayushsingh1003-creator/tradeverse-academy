export { dynamic } from "@/lib/route-dynamic";

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ plan: "free", status: "inactive", isPremium: false });

  const subscription = await db.subscription.findUnique({ where: { authUserId: userId } });
  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "inactive";

  return NextResponse.json({
    plan,
    status,
    isPremium: plan !== "free" && ["active", "trialing"].includes(status),
  });
}

