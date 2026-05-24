import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard/getLeaderboard";
import { resolveUserForClerk } from "@/lib/server/resolveDbUser";

export const dynamic = "force-dynamic";

/** @deprecated Prefer GET /api/leaderboard?tab=weekly */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await currentUser();
  const email = clerk?.primaryEmailAddress?.emailAddress ?? null;
  const me = await resolveUserForClerk(userId, email);
  if (!me) return NextResponse.json({ error: "No account" }, { status: 404 });

  const result = await getLeaderboard("weekly", me.id);
  return NextResponse.json(result.rows);
}
