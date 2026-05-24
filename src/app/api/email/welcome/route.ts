import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await sendWelcomeEmail(body.to, body.name ?? "Trader");
  return NextResponse.json({ ok: true });
}
