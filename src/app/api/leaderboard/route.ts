import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, parseLeaderboardTab } from "@/lib/leaderboard/getLeaderboard";
import { finalizeSeasonIfDue } from "@/lib/league/finalizeRound";
import { resolveUserForClerk } from "@/lib/server/resolveDbUser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await currentUser();
  const email = clerk?.primaryEmailAddress?.emailAddress ?? null;
  const me = await resolveUserForClerk(userId, email);
  if (!me) {
    return NextResponse.json(
      { error: "No account linked. Complete sign-up or run database seed." },
      { status: 404 },
    );
  }

  const tab = parseLeaderboardTab(req.nextUrl.searchParams.get("tab"));
  if (tab === "weekly") {
    await finalizeSeasonIfDue();
  }
  const result = await getLeaderboard(tab, me.id);
  return NextResponse.json(result);
}
