import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({ where: { xp: { gt: 0 } } });
  let sent = 0;
  for (const user of users) {
    await sendWeeklyDigestEmail(user.email, user.name, {
      xpEarned: user.xp,
      lessonsCompleted: 0,
      leaguePosition: 0,
      recommendations: ["Candlestick Essentials", "Support & Resistance", "RSI Basics"],
    });
    sent += 1;
  }

  return NextResponse.json({ sent, resetWeeklyXP: false });
}
