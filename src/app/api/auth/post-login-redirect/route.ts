import { NextResponse } from "next/server";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";

/** Called by the client right after a successful sign-in — picks dashboard vs
 * onboarding based on DB state, which the browser can't read directly (Prisma-like
 * client, needs the server). */
export async function GET() {
  const authUserId = await getAuthUserId();
  if (!authUserId) {
    return NextResponse.json({ url: "/onboarding" });
  }
  const email = await getAuthUserEmail();
  const url = await resolvePostAuthUrl(authUserId, email);
  return NextResponse.json({ url });
}
