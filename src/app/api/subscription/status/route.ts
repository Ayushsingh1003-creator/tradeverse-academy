export { dynamic } from "@/lib/route-dynamic";

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/session";
import { resolvePremiumStatus } from "@/lib/premium/resolvePremiumStatus";

export async function GET() {
  const userId = await getAuthUserId();
  const result = await resolvePremiumStatus(userId);
  return NextResponse.json(result);
}
