import { db } from "@/lib/db";
import { ensureActiveSeason, getActiveSeason } from "@/lib/league/season";
import type { LeaderboardResult, LeaderboardRow, LeaderboardTab } from "@/lib/leaderboard/types";

const TAB_SET = new Set<LeaderboardTab>(["weekly", "all-time", "friends", "country"]);

export function parseLeaderboardTab(raw: string | null): LeaderboardTab {
  if (raw && TAB_SET.has(raw as LeaderboardTab)) return raw as LeaderboardTab;
  return "weekly";
}

function rankRows(
  users: {
    id: string;
    name: string;
    avatar: string | null;
    xp: number;
    level: number;
    league: string;
  }[],
  xpByUser: Map<string, number> | null,
  meId: string,
  limit = 50,
): LeaderboardRow[] {
  const scored = users.map((u) => ({
    ...u,
    displayXp: xpByUser ? (xpByUser.get(u.id) ?? 0) : u.xp,
  }));

  scored.sort(
    (a, b) => b.displayXp - a.displayXp || a.name.localeCompare(b.name),
  );

  return scored.slice(0, limit).map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    xp: u.displayXp,
    level: u.level,
    league: u.league,
    isMe: u.id === meId,
  }));
}

export async function getLeaderboard(tab: LeaderboardTab, meId: string): Promise<LeaderboardResult> {
  const me = await db.user.findUnique({
    where: { id: meId },
    select: { id: true, name: true, xp: true, country: true },
  });
  if (!me) {
    return { tab, rows: [], myRank: null, myXp: 0, message: "Account not found." };
  }

  if (tab === "weekly") {
    let season = await getActiveSeason();
    if (!season || season.endsAt <= new Date()) season = await ensureActiveSeason();

    const sums = await db.xpLedger.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: season.startsAt, lte: season.endsAt },
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    });
    const periodXp = new Map<string, number>();
    for (const row of sums) {
      periodXp.set(row.userId, row._sum.amount ?? 0);
    }

    const rankedIds = [...periodXp.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([id]) => id);

    const topIds = rankedIds.slice(0, 50);
    let displayIds = topIds;
    if (!displayIds.includes(meId)) {
      displayIds =
        displayIds.length >= 50 ? [...displayIds.slice(0, 49), meId] : [...displayIds, meId];
    }

    const users = await db.user.findMany({
      where: { id: { in: displayIds.length > 0 ? displayIds : [meId] } },
      select: { id: true, name: true, avatar: true, xp: true, level: true, league: true },
    });

    const rows = rankRows(users, periodXp, meId);
    const myRow = rows.find((r) => r.isMe);
    const myRankIndex = rankedIds.indexOf(meId);
    const myRankEntry = myRankIndex >= 0 ? { rank: myRankIndex + 1 } : null;

    const msLeft = Math.max(0, season.endsAt.getTime() - Date.now());
    const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));

    return {
      tab,
      rows,
      myRank: myRankEntry?.rank ?? null,
      myXp: myRow?.xp ?? periodXp.get(meId) ?? 0,
      season: {
        startsAt: season.startsAt.toISOString(),
        endsAt: season.endsAt.toISOString(),
        daysLeft,
        label: daysLeft === 0 ? "Round ending soon" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
      },
    };
  }

  if (tab === "all-time") {
    const users = await db.user.findMany({
      select: { id: true, name: true, avatar: true, xp: true, level: true, league: true },
      orderBy: [{ xp: "desc" }, { name: "asc" }],
      take: 50,
    });

    const rows: LeaderboardRow[] = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      xp: u.xp,
      level: u.level,
      league: u.league,
      isMe: u.id === meId,
    }));

    const totalUsers = await db.user.count();
    const ahead = await db.user.count({ where: { xp: { gt: me.xp } } });
    const myRank = totalUsers > 0 ? ahead + 1 : null;

    return {
      tab,
      rows,
      myRank,
      myXp: me.xp,
    };
  }

  if (tab === "friends") {
    const follows = await db.follow.findMany({
      where: { followerId: meId },
      select: { followingId: true },
    });

    const friendIds = [...new Set([meId, ...follows.map((f) => f.followingId)])];

    if (follows.length === 0) {
      const self = await db.user.findUnique({
        where: { id: meId },
        select: { id: true, name: true, avatar: true, xp: true, level: true, league: true },
      });
      const rows: LeaderboardRow[] = self
        ? [
            {
              rank: 1,
              userId: self.id,
              name: self.name,
              avatar: self.avatar,
              xp: self.xp,
              level: self.level,
              league: self.league,
              isMe: true,
            },
          ]
        : [];

      return {
        tab,
        rows,
        myRank: 1,
        myXp: me.xp,
        message:
          "Follow traders from their profile to compare XP with people you know. Until then, only your row is shown.",
      };
    }

    const users = await db.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, name: true, avatar: true, xp: true, level: true, league: true },
    });

    const rows = rankRows(users, null, meId, friendIds.length);
    const myRow = rows.find((r) => r.isMe);

    return {
      tab,
      rows,
      myRank: myRow?.rank ?? null,
      myXp: myRow?.xp ?? me.xp,
    };
  }

  // country
  if (!me.country) {
    return {
      tab,
      rows: [],
      myRank: null,
      myXp: me.xp,
      country: null,
      message: "Add your country in profile settings to see a country leaderboard.",
    };
  }

  const users = await db.user.findMany({
    where: { country: me.country },
    select: { id: true, name: true, avatar: true, xp: true, level: true, league: true },
    orderBy: [{ xp: "desc" }, { name: "asc" }],
    take: 50,
  });

  const rows: LeaderboardRow[] = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    xp: u.xp,
    level: u.level,
    league: u.league,
    isMe: u.id === meId,
  }));

  const ahead = await db.user.count({
    where: { country: me.country, xp: { gt: me.xp } },
  });

  return {
    tab,
    rows,
    myRank: users.length > 0 ? ahead + 1 : null,
    myXp: me.xp,
    country: me.country,
  };
}
