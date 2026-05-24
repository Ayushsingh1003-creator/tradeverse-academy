import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const type = body?.type as string | undefined;
  if (type !== "user.created" && type !== "user.updated") {
    return NextResponse.json({ ignored: true });
  }

  const user = body?.data;
  const clerkUserId = user?.id as string | undefined;
  const email = user?.email_addresses?.[0]?.email_address;
  const name = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Trader";
  if (!email || !clerkUserId) {
    return NextResponse.json({ error: "No email or clerk id" }, { status: 400 });
  }

  await db.user.upsert({
    where: { email },
    create: {
      email,
      name,
      avatar: user?.image_url ?? null,
      clerkUserId,
    },
    update: {
      name,
      avatar: user?.image_url ?? null,
      clerkUserId,
    },
  });

  if (type === "user.created") {
    await sendWelcomeEmail(email, name);
  }

  return NextResponse.json({ ok: true });
}
