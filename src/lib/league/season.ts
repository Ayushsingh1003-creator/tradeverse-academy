import { db } from "@/lib/db";
import { finalizeSeasonIfDue } from "@/lib/league/finalizeRound";

export function leaguePeriodMs(): number {
  const d = Number.parseInt(process.env.LEAGUE_PERIOD_DAYS ?? "3", 10);
  const days = Number.isFinite(d) && d > 0 ? d : 3;
  return days * 24 * 60 * 60 * 1000;
}

/** Current open round (may already be past `endsAt` until cron finalizes). */
export async function getActiveSeason() {
  return db.leagueSeason.findFirst({
    where: { finalizedAt: null },
    orderBy: { startsAt: "desc" },
  });
}

/** Returns the current open league round, rolling forward if the previous one ended. */
export async function ensureActiveSeason() {
  let existing = await getActiveSeason();
  if (existing && existing.endsAt > new Date()) {
    return existing;
  }
  if (existing) {
    await finalizeSeasonIfDue();
    existing = await getActiveSeason();
    if (existing && existing.endsAt > new Date()) {
      return existing;
    }
  }
  const now = new Date();
  const endsAt = new Date(now.getTime() + leaguePeriodMs());
  return db.leagueSeason.create({
    data: { startsAt: now, endsAt },
  });
}
