import { NextRequest, NextResponse } from "next/server";
import { sendLevelUpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await sendLevelUpEmail(body.to, body.name ?? "Trader", body.newLevel ?? 1, body.title ?? "Trader");
  return NextResponse.json({ ok: true });
}
