export { dynamic } from "@/lib/route-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { resolveIsAdmin } from "@/lib/admin/checkAdmin";
import { requireDbUser } from "@/lib/auth/api";
import { db } from "@/lib/db";

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser, authUserId } = authResult;
  const isAdmin = await resolveIsAdmin(dbUser.email, authUserId);

  const localDate = req.nextUrl.searchParams.get("localDate")?.trim() ?? "";
  let dailyChallengeCompletedToday = false;
  if (LOCAL_DATE_RE.test(localDate)) {
    const entry = await db.xpLedger.findFirst({
      where: { userId: dbUser.id, idempotencyKey: `daily:${localDate}` },
      select: { id: true },
    });
    dailyChallengeCompletedToday = Boolean(entry);
  }

  return NextResponse.json({
    xp: dbUser.xp,
    level: dbUser.level,
    league: dbUser.league,
    name: dbUser.name,
    avatar: dbUser.avatar,
    streak: dbUser.streak,
    streakLocalDate: dbUser.streakLocalDate,
    ianaTimezone: dbUser.ianaTimezone,
    dailyChallengeCompletedToday,
    role: dbUser.role,
    isAdmin,
  });
}
