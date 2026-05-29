import { requireDbUser } from "@/lib/auth/api";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: { commentId: string } }) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { authUserId: userId, dbUser } = authResult;

  const body = (await request.json()) as { body?: string };
  const text = (body.body ?? "").trim();
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "Reply must be 1–500 characters" }, { status: 400 });
  }

  const parent = await db.lessonComment.findUnique({ where: { id: params.commentId } });
  if (!parent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reply = await db.lessonCommentReply.create({
    data: {
      commentId: parent.id,
      clerkUserId: userId,
      userName: dbUser.name?.split(/\s+/)[0] || dbUser.name || "Trader",
      body: text,
    },
  });

  return NextResponse.json({ reply });
}
