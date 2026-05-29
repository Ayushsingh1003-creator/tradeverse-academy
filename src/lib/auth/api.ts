import { NextResponse } from "next/server";
import { getAuthUserEmail, getAuthUserId, getAuthUserName } from "@/lib/auth/session";
import { resolveUserForAuth } from "@/lib/server/resolveDbUser";
import type { User } from "@/lib/db/schema";

export async function requireDbUser(): Promise<
  | { authUserId: string; dbUser: User; error?: undefined }
  | { error: NextResponse; authUserId?: undefined; dbUser?: undefined }
> {
  const authUserId = await getAuthUserId();
  if (!authUserId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const email = await getAuthUserEmail();
  const name = await getAuthUserName();
  const dbUser = await resolveUserForAuth(authUserId, email, { name });
  if (!dbUser) {
    return { error: NextResponse.json({ error: "No account" }, { status: 404 }) };
  }
  return { authUserId, dbUser: dbUser as User };
}
