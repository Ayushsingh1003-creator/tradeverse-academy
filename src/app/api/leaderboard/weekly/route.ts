import { requireDbUser } from "@/lib/auth/api";
import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard/getLeaderboard";

export const dynamic = "force-dynamic";

/** @deprecated Prefer GET /api/leaderboard?tab=weekly */
export async function GET() {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser: me } = authResult;

  const result = await getLeaderboard("weekly", me.id);
  return NextResponse.json(result.rows);
}

