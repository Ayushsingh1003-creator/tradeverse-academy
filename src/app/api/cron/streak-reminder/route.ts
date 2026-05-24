import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStreakReminderEmail } from "@/lib/email";
import { localDateStringInTimeZone } from "@/lib/server/localDateInTimeZone";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const candidates = await db.user.findMany({
    where: {
      streak: { gte: 3 },
      streakLocalDate: { not: null },
    },
  });

  let sent = 0;
  for (const user of candidates) {
    const localToday = localDateStringInTimeZone(user.ianaTimezone, now);
    if (!user.streakLocalDate || user.streakLocalDate === localToday) continue;
    await sendStreakReminderEmail(user.email, user.name, user.streak);
    sent += 1;
  }

  return NextResponse.json({ sent });
}
