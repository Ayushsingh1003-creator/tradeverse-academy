export { dynamic } from "@/lib/route-dynamic";

import { requireDbUser } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  
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
