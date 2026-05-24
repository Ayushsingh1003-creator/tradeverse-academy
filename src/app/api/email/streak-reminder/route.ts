import { NextRequest, NextResponse } from "next/server";
import { sendStreakReminderEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await sendStreakReminderEmail(body.to, body.name ?? "Trader", body.streak ?? 3);
  return NextResponse.json({ ok: true });
}
