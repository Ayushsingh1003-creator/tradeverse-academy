import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Resolves the DB user for a Clerk session. Returns null if no row matches or if the
 * SQLite schema is behind Prisma (missing columns such as `clerkUserId`). In that case
 * run `npx prisma db push` (or apply migrations) against the same `DATABASE_URL` the app uses.
 */
export async function resolveUserForClerk(
  clerkUserId: string,
  email: string | null,
  profile?: { name?: string | null },
) {
  try {
    const byClerk = await db.user.findUnique({ where: { clerkUserId } });
    if (byClerk) return byClerk;
    if (!email) return null;
    const byEmail = await db.user.findUnique({ where: { email } });
    if (byEmail) {
      if (!byEmail.clerkUserId) {
        return db.user.update({
          where: { id: byEmail.id },
          data: { clerkUserId },
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
        clerkUserId,
        name: name.slice(0, 80),
      },
    });  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.warn(
        "[resolveUserForClerk] Prisma error (is DATABASE_URL in sync? run `npx prisma db push`):",
        e.code,
        e.message,
      );
      return null;
    }
    throw e;
  }
}