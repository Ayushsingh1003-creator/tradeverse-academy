import { NextResponse } from "next/server";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";

/** Called by the client right after a successful sign-in — picks dashboard vs
 * onboarding based on DB state, which the browser can't read directly (Prisma-like
 * client, needs the server). */
export async function GET() {
  const authUserId = await getAuthUserId();
  if (!authUserId) {
    // Distinct from a genuine "needs onboarding" result — the client should not
    // treat this the same way (e.g. navigating to /onboarding here would just
    // bounce straight back to sign-in via middleware's own session check).
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }
  const email = await getAuthUserEmail();
  const url = await resolvePostAuthUrl(authUserId, email);
  return NextResponse.json({ url });
}
