import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await sendWeeklyDigestEmail(body.to, body.name ?? "Trader", body.stats ?? { xpEarned: 0, lessonsCompleted: 0, leaguePosition: 0, recommendations: [] });
  return NextResponse.json({ ok: true });
}
