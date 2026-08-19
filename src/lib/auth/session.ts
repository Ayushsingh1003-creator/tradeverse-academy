import { cookies } from "next/headers";
import { verifyTradeverseIdAccessToken } from "@/lib/auth/tradeverseId";

// Same exported shape as the old Neon Auth version (getSession/getAuthUserId/
// getAuthUserEmail/getAuthUserName) deliberately — every other file in this app
// that reads the session goes through these four functions, not the underlying
// mechanism, so replacing Neon Auth with Tradeverse ID only required changing this
// one file's internals.
export async function getSession() {
  const token = cookies().get("tv_session")?.value;
  if (!token) return null;
  const user = await verifyTradeverseIdAccessToken(token);
  if (!user) return null;
  // `name`/`image` aren't in the token (Tradeverse ID's identity table doesn't
  // carry them) — callers needing a display name already fall back to deriving one
  // from the email locally (see resolveDbUser.ts) or read it from the DB2 User row.
  return { user: { id: user.id, email: user.email, name: null as string | null, image: null as string | null } };
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function getAuthUserEmail(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.email ?? null;
}

export async function getAuthUserName(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.name ?? null;
}
