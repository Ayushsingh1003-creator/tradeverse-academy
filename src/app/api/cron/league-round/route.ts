import { NextRequest, NextResponse } from "next/server";
import { finalizeSeasonIfDue } from "@/lib/league/finalizeRound";
import { ensureActiveSeason } from "@/lib/league/season";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureActiveSeason();
  const result = await finalizeSeasonIfDue();

  return NextResponse.json({
    ok: true,
    finalized: result.finalized,
    seasonId: result.seasonId,
    promotions: result.promotions ?? 0,
  });
}
