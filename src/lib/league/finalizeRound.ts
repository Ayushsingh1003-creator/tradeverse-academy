import { db } from "@/lib/db";
import { COMPETITIVE_LEAGUE_IDS, nextLeagueTier } from "@/lib/league/tiers";
import { getActiveSeason, leaguePeriodMs } from "@/lib/league/season";

const TOP_ADVANCE = 10;

export type FinalizeResult = { finalized: boolean; seasonId?: string; promotions?: number };

/**
 * If the open season has ended, promote top `TOP_ADVANCE` per tier by period XP,
 * mark season finalized, and create the next season.
 */
export async function finalizeSeasonIfDue(): Promise<FinalizeResult> {
  const season = await getActiveSeason();
  if (!season) return { finalized: false };
  if (season.endsAt > new Date()) return { finalized: false };

  let promotions = 0;

  await db.$transaction(async (tx) => {
    const allUsers = await tx.user.findMany({ select: { id: true, league: true } });
    const leagueAtStart = new Map(allUsers.map((u) => [u.id, u.league]));

    for (const tierId of COMPETITIVE_LEAGUE_IDS) {
      const nextId = nextLeagueTier(tierId);
      if (!nextId) continue;

      const ids = allUsers.filter((u) => leagueAtStart.get(u.id) === tierId).map((u) => u.id);
      if (ids.length === 0) continue;

      const sums = await tx.xpLedger.groupBy({
        by: ["userId"],
        where: {
          userId: { in: ids },
          createdAt: { gte: season.startsAt, lte: season.endsAt },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      });
      const byUser = new Map<string, number>();
      for (const row of sums) {
        byUser.set(row.userId, row._sum.amount ?? 0);
      }

      const ranked = [...ids].sort((a, b) => (byUser.get(b) ?? 0) - (byUser.get(a) ?? 0));
      const top = ranked.slice(0, TOP_ADVANCE);
      for (const id of top) {
        await tx.user.update({
          where: { id },
          data: { league: nextId },
        });
        promotions += 1;
      }
    }

    await tx.leagueSeason.update({
      where: { id: season.id },
      data: { finalizedAt: new Date() },
    });

    const nextStart = season.endsAt;
    const nextEnd = new Date(nextStart.getTime() + leaguePeriodMs());
    await tx.leagueSeason.create({
      data: { startsAt: nextStart, endsAt: nextEnd },
    });
  });

  return { finalized: true, seasonId: season.id, promotions };
}
