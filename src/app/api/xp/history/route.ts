import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserForClerk } from "@/lib/server/resolveDbUser";
import { db } from "@/lib/db";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await currentUser();
  const email = clerk?.primaryEmailAddress?.emailAddress ?? null;
  const name = clerk?.fullName ?? clerk?.firstName ?? null;
  const dbUser = await resolveUserForClerk(userId, email, { name });
  if (!dbUser) return NextResponse.json({ error: "No account" }, { status: 404 });

  const page = Math.max(0, Number.parseInt(req.nextUrl.searchParams.get("page") ?? "0", 10) || 0);

  const [rows, total] = await Promise.all([
    db.xpLedger.findMany({
      where: { userId: dbUser.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        reason: true,
        ref: true,
        createdAt: true,
      },
    }),
    db.xpLedger.count({ where: { userId: dbUser.id } }),
  ]);

  return NextResponse.json({
    rows,
    page,
    pageSize: PAGE_SIZE,
    total,
    hasMore: (page + 1) * PAGE_SIZE < total,
  });
}
