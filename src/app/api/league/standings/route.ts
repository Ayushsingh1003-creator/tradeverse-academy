export { dynamic } from "@/lib/route-dynamic";

import { requireDbUser } from "@/lib/auth/api";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { finalizeSeasonIfDue } from "@/lib/league/finalizeRound";
import { ensureActiveSeason, getActiveSeason } from "@/lib/league/season";
import { isValidLeagueId, leagueColor, leagueDisplayName } from "@/lib/league/tiers";

function msUntilEnd(endsAt: Date): number {
  return Math.max(0, endsAt.getTime() - Date.now());
}

export async function GET() {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser: me } = authResult;

  await finalizeSeasonIfDue();
  let season = await getActiveSeason();
  if (!season || season.endsAt <= new Date()) season = await ensureActiveSeason();

  const leagueId = isValidLeagueId(me.league) ? me.league : "bronze";
  if (me.league !== leagueId) {
    await db.user.update({ where: { id: me.id }, data: { league: leagueId } });
  }

  const peers = (await db.user.findMany({
    where: { league: leagueId },
    select: { id: true, name: true, avatar: true, authUserId: true },
    take: 200,
  })) as { id: string; name: string; avatar: string | null; authUserId: string | null }[];

  const peerIds = peers.map((p) => p.id);
  const sums =
    peerIds.length === 0
      ? []
      : await db.xpLedger.groupBy({
          by: ["userId"],
          where: {
            userId: { in: peerIds },
            createdAt: { gte: season.startsAt, lte: season.endsAt },
            amount: { gt: 0 },
          },
          _sum: { amount: true },
        });

  const periodXp = new Map<string, number>();
  for (const row of sums) {
    periodXp.set(row.userId, row._sum.amount ?? 0);
  }

  const ranked = peers
    .map((p) => ({
      userId: p.id,
      name: p.name,
      avatar: p.avatar,
      periodXp: periodXp.get(p.id) ?? 0,
      isMe: p.id === me.id,
    }))
    .sort((a, b) => b.periodXp - a.periodXp || a.name.localeCompare(b.name));

  const withRanks = ranked.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    name: row.name,
    avatar: row.avatar,
    periodXp: row.periodXp,
    isMe: row.isMe,
  }));
  const top = withRanks.slice(0, 15);
  const myRow = withRanks.find((r) => r.isMe);

  const msLeft = msUntilEnd(season.endsAt);
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000)) || 0;

  return NextResponse.json({
    league: leagueId,
    leagueLabel: leagueDisplayName(leagueId),
    leagueColor: leagueColor(leagueId),
    season: {
      startsAt: season.startsAt.toISOString(),
      endsAt: season.endsAt.toISOString(),
      finalized: season.finalizedAt != null,
    },
    daysLeft,
    msLeft,
    roundEndedPending: season.endsAt <= new Date() && season.finalizedAt == null,
    rows: top,
    myRank: myRow?.rank ?? null,
    myPeriodXp: myRow?.periodXp ?? 0,
  });
}

