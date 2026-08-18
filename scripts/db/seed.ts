import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { createId } = await import("@paralleldrive/cuid2");
  const { db } = await import("../../src/lib/db");

  const banner = await db.siteBannerConfig.findUnique({ where: { id: "default" } });
  if (!banner) {
    await db.siteBannerConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        enabled: true,
        message: "Tradeverse update: Track your streak, XP, and lessons from your dashboard.",
        variant: "rainbow",
        bannerId: "dashboard-top-banner",
      },
      update: {},
    });
  }

  const free = await db.user.findUnique({ where: { email: "free@tradeverse.com" } });
  if (!free) {
    await db.user.create({
      data: {
        id: createId(),
        email: "free@tradeverse.com",
        name: "Free Trader",
        xp: 120,
        level: 2,
        league: "bronze",
        country: "IN",
      },
    });
  }

  const premium = await db.user.findUnique({ where: { email: "premium@tradeverse.com" } });
  if (!premium) {
    await db.user.create({
      data: {
        id: createId(),
        email: "premium@tradeverse.com",
        name: "Premium Trader",
        isPremium: true,
        xp: 2400,
        level: 8,
        league: "gold",
        country: "IN",
      },
    });
  }

  console.log("Seed complete (banner + demo users). Run library seed separately if needed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
