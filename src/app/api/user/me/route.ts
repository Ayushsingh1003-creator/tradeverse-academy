import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveUserForClerk } from "@/lib/server/resolveDbUser";

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await currentUser();
  const email = clerk?.primaryEmailAddress?.emailAddress ?? null;
  const name = clerk?.fullName ?? clerk?.firstName ?? null;
  const dbUser = await resolveUserForClerk(userId, email, { name });
  if (!dbUser) return NextResponse.json({ error: "No account" }, { status: 404 });

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
  });
}
