import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await db.user.findFirst({
    include: {
      progress: { include: { lesson: true }, orderBy: { completedAt: "desc" }, take: 5 },
    },
  });
  if (!user) return NextResponse.json({ error: "No user data" }, { status: 404 });
  return NextResponse.json(user);
}
