/**
 * Seeds leaderboard demo users + weekly XP ledger rows.
 * Safe to re-run: upserts by email, skips existing ledger dupes via idempotency keys.
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DEMO_TRADERS = [
  { email: "ava@tradeverse.demo", name: "Ava Chen", xp: 14200, level: 12, league: "gold", country: "IN" },
  { email: "noah@tradeverse.demo", name: "Noah Patel", xp: 13300, level: 11, league: "gold", country: "IN" },
  { email: "mia@tradeverse.demo", name: "Mia Sharma", xp: 12700, level: 11, league: "silver", country: "IN" },
  { email: "kai@tradeverse.demo", name: "Kai Mehta", xp: 48200, level: 22, league: "diamond", country: "IN" },
  { email: "sam@tradeverse.demo", name: "Sam Roy", xp: 44100, level: 20, league: "platinum", country: "IN" },
  { email: "jordan@tradeverse.demo", name: "Jordan Lee", xp: 9400, level: 7, league: "bronze", country: "US" },
  { email: "priya@tradeverse.demo", name: "Priya Nair", xp: 8600, level: 6, league: "bronze", country: "IN" },
  { email: "arjun@tradeverse.demo", name: "Arjun Das", xp: 7200, level: 6, league: "bronze", country: "IN" },
] as const;

const WEEKLY_XP_SPLITS: Record<string, number[]> = {
  "ava@tradeverse.demo": [420, 380, 310],
  "noah@tradeverse.demo": [390, 350, 290],
  "mia@tradeverse.demo": [360, 340, 270],
  "kai@tradeverse.demo": [180, 160, 140],
  "sam@tradeverse.demo": [150, 140, 120],
  "jordan@tradeverse.demo": [80, 70, 60],
  "priya@tradeverse.demo": [95, 85, 75],
  "arjun@tradeverse.demo": [70, 65, 55],
  "premium@tradeverse.com": [200, 180, 150],
  "free@tradeverse.com": [120, 100, 80],
};

async function ensureSeason(db: Awaited<typeof import("../../src/lib/db")>["db"]) {
  const open = await db.leagueSeason.findFirst({
    where: { finalizedAt: null },
    orderBy: { startsAt: "desc" },
  });
  if (open) return open;

  const now = new Date();
  const endsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return db.leagueSeason.create({
    data: { startsAt: now, endsAt },
  });
}

async function main() {
  const { createId } = await import("@paralleldrive/cuid2");
  const { db } = await import("../../src/lib/db");

  const season = await ensureSeason(db);
  const userIds = new Map<string, string>();

  for (const trader of DEMO_TRADERS) {
    const user = await db.user.upsert({
      where: { email: trader.email },
      create: {
        id: createId(),
        email: trader.email,
        name: trader.name,
        xp: trader.xp,
        level: trader.level,
        league: trader.league,
        country: trader.country,
      },
      update: {
        name: trader.name,
        xp: trader.xp,
        level: trader.level,
        league: trader.league,
        country: trader.country,
      },
    });
    userIds.set(trader.email, user.id);
  }

  const premium = await db.user.findUnique({ where: { email: "premium@tradeverse.com" } });
  const free = await db.user.findUnique({ where: { email: "free@tradeverse.com" } });
  if (premium) userIds.set("premium@tradeverse.com", premium.id);
  if (free) userIds.set("free@tradeverse.com", free.id);

  if (premium && premium.country == null) {
    await db.user.update({ where: { id: premium.id }, data: { country: "IN" } });
  }
  if (free && free.country == null) {
    await db.user.update({ where: { id: free.id }, data: { country: "IN" } });
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const [email, amounts] of Object.entries(WEEKLY_XP_SPLITS)) {
    const userId = userIds.get(email);
    if (!userId) continue;

    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i]!;
      const key = `seed-weekly-${season.id}-${userId}-${i}`;
      const createdAt = new Date(Math.max(season.startsAt.getTime(), now - (2 - i) * dayMs));

      await db.xpLedger.upsert({
        where: { idempotencyKey: key },
        create: {
          id: createId(),
          userId,
          amount,
          reason: "lesson",
          ref: "seed-leaderboard",
          idempotencyKey: key,
          createdAt,
        },
        update: { amount, createdAt },
      });
    }
  }

  if (premium && userIds.has("ava@tradeverse.demo")) {
    const avaId = userIds.get("ava@tradeverse.demo")!;
    const miaId = userIds.get("mia@tradeverse.demo");
    await db.follow.upsert({
      where: { followerId_followingId: { followerId: premium.id, followingId: avaId } },
      create: { followerId: premium.id, followingId: avaId },
      update: {},
    });
    if (miaId) {
      await db.follow.upsert({
        where: { followerId_followingId: { followerId: premium.id, followingId: miaId } },
        create: { followerId: premium.id, followingId: miaId },
        update: {},
      });
    }
  }

  console.log(`Leaderboard seed complete (${DEMO_TRADERS.length} demo traders, season ${season.id}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
