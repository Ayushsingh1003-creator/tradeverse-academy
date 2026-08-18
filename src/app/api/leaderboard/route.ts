import { requireDbUser } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, parseLeaderboardTab } from "@/lib/leaderboard/getLeaderboard";
import { finalizeSeasonIfDue } from "@/lib/league/finalizeRound";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser: me } = authResult;

  const tab = parseLeaderboardTab(req.nextUrl.searchParams.get("tab"));
  if (tab === "weekly") {
    await finalizeSeasonIfDue();
  }
  const result = await getLeaderboard(tab, me.id);
  return NextResponse.json(result);
}

