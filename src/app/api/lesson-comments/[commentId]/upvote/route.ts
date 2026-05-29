import { getAuthUserId } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: { commentId: string } }) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await db.lessonComment.findUnique({ where: { id: params.commentId } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await db.commentUpvote.findUnique({
    where: { clerkUserId_commentId: { clerkUserId: userId, commentId: comment.id } },
  });

  if (existing) {
    await db.commentUpvote.delete({ where: { clerkUserId_commentId: { clerkUserId: userId, commentId: comment.id } } });
    await db.lessonComment.update({
      where: { id: comment.id },
      data: { upvotes: Math.max(0, comment.upvotes - 1) },
    });
    return NextResponse.json({ upvoted: false, upvotes: comment.upvotes - 1 });
  }

  await db.commentUpvote.create({ data: { clerkUserId: userId, commentId: comment.id } });
  await db.lessonComment.update({
    where: { id: comment.id },
    data: { upvotes: comment.upvotes + 1 },
  });
  return NextResponse.json({ upvoted: true, upvotes: comment.upvotes + 1 });
}
