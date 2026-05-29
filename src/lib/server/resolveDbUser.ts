import { db } from "@/lib/db";

/**
 * Resolves the app User row for a Neon Auth session. Creates or links by email on first sign-in.
 */
export async function resolveUserForAuth(
  authUserId: string,
  email: string | null,
  profile?: { name?: string | null },
) {
  try {
    const byAuth = await db.user.findUnique({ where: { authUserId } });
    if (byAuth) return byAuth;
    if (!email) return null;
    const byEmail = await db.user.findUnique({ where: { email } });
    if (byEmail) {
      if (!byEmail.authUserId) {
        return db.user.update({
          where: { id: byEmail.id },
          data: { authUserId },
        });
      }
      return byEmail;
    }
    const name =
      profile?.name?.trim() ||
      email.split("@")[0]?.replace(/[._-]+/g, " ") ||
      "Trader";
    return db.user.create({
      data: {
        email,
        authUserId,
        name: name.slice(0, 80),
      },
    });
  } catch (e) {
    console.warn("[resolveUserForAuth] Database error (run `npm run db:push`):", e);
    return null;
  }
}

/** @deprecated Use resolveUserForAuth */
export const resolveUserForClerk = resolveUserForAuth;
