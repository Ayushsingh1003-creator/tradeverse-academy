import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/api";
import { applyXp } from "@/lib/xp";
import { isXpEarnReason, maxXpForReason } from "@/lib/xpEarnPolicy";
import { isValidIanaTimezone } from "@/lib/server/localDateInTimeZone";
import { computeNewStreak } from "@/lib/streak";
import { db } from "@/lib/db";

const GLOBAL_CAP = 500;

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const STREAK_SYNC_REASONS = new Set<string>(["lesson", "streak", "daily_challenge"]);

export async function POST(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  let body: {
    amount?: number;
    reason?: string;
    ref?: string;
    idempotencyKey?: string;
    activityLocalDate?: string;
    ianaTimezone?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const amount = typeof body.amount === "number" ? Math.floor(body.amount) : NaN;
  const reason = typeof body.reason === "string" ? body.reason : "";
  const ref = typeof body.ref === "string" ? body.ref.slice(0, 200) : undefined;
  const idempotencyKey =
    typeof body.idempotencyKey === "string" ? body.idempotencyKey.slice(0, 200) : undefined;

  const activityLocalDateRaw =
    typeof body.activityLocalDate === "string" ? body.activityLocalDate.trim() : "";
  const activityLocalDate =
    activityLocalDateRaw.length > 0 && LOCAL_DATE_RE.test(activityLocalDateRaw)
      ? activityLocalDateRaw
      : undefined;

  const ianaTimezoneRaw = typeof body.ianaTimezone === "string" ? body.ianaTimezone.slice(0, 64) : undefined;
  const ianaTimezoneToStore =
    ianaTimezoneRaw && isValidIanaTimezone(ianaTimezoneRaw) ? ianaTimezoneRaw.trim() : undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!isXpEarnReason(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const perReasonCap = maxXpForReason(reason);
  const capped =
    reason === "admin"
      ? Math.min(amount, perReasonCap)
      : Math.min(amount, perReasonCap, GLOBAL_CAP);

  if (idempotencyKey) {
    const existing = await db.xpLedger.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.userId !== dbUser.id) {
        return NextResponse.json({ error: "Idempotency conflict" }, { status: 409 });
      }
      const u = await db.user.findUnique({ where: { id: dbUser.id } });
      return NextResponse.json({
        ok: true,
        duplicate: true,
        xp: u?.xp ?? dbUser.xp,
        level: u?.level ?? dbUser.level,
        streak: u?.streak ?? dbUser.streak,
        streakLocalDate: u?.streakLocalDate ?? dbUser.streakLocalDate ?? null,
      });
    }
  }

  const { xp: nextXp, level: nextLevel } = applyXp(dbUser.xp, dbUser.level, capped);

  const streakSync = STREAK_SYNC_REASONS.has(reason) && Boolean(activityLocalDate);
  let streakChanged = false;
  const streakData: { streak?: number; streakLocalDate?: string } = {};
  if (streakSync && activityLocalDate) {
    const { newStreak, changed } = computeNewStreak(
      dbUser.streakLocalDate ?? null,
      activityLocalDate,
      dbUser.streak,
    );
    streakChanged = changed;
    if (changed) {
      streakData.streak = newStreak;
      streakData.streakLocalDate = activityLocalDate;
    }
  }

  const pingQualifyingActivity = streakSync;

  const [, updatedUser] = await db.$transaction([
    db.xpLedger.create({
      data: {
        userId: dbUser.id,
        amount: capped,
        reason,
        ref: ref ?? null,
        idempotencyKey: idempotencyKey ?? null,
      },
    }),
    db.user.update({
      where: { id: dbUser.id },
      data: {
        xp: nextXp,
        level: nextLevel,
        ...streakData,
        ...(pingQualifyingActivity ? { lastActiveDate: new Date() } : {}),
        ...(ianaTimezoneToStore ? { ianaTimezone: ianaTimezoneToStore } : {}),
      },
      select: { streak: true, streakLocalDate: true, xp: true, level: true },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    xp: updatedUser.xp,
    level: updatedUser.level,
    granted: capped,
    streak: updatedUser.streak,
    streakLocalDate: updatedUser.streakLocalDate,
    streakChanged,
  });
}
