import { requireDbUser } from "@/lib/auth/api";
import { getAuthUserId, getAuthUserName } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { LessonComment } from "@/lib/db/schema";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "helpful";
  const userId = await getAuthUserId();

  const comments = (await db.lessonComment.findMany({
    where: { lessonSlug: params.slug },
    orderBy: sort === "newest" ? { createdAt: "desc" } : { upvotes: "desc" },
    take: 50,
  })) as LessonComment[];

  const withReplies = await Promise.all(
    comments.map(async (c: LessonComment) => {
      const replies = await db.lessonCommentReply.findMany({
        where: { commentId: c.id },
        orderBy: { createdAt: "asc" },
      });
      return { ...c, replies };
    }),
  );

  const filtered =
    sort === "mine" && userId
      ? withReplies.filter((c) => c.authUserId === userId)
      : withReplies;

  const pinned = filtered.filter((c) => c.pinned);
  const rest = filtered.filter((c) => !c.pinned);
  const ordered = [...pinned, ...rest];

  return NextResponse.json({ comments: ordered });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { authUserId: userId, dbUser } = authResult;

  const displayName = (await getAuthUserName()) || dbUser.name || "Trader";
  const body = (await request.json()) as { body?: string };
  const text = (body.body ?? "").trim();
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "Comment must be 1–500 characters" }, { status: 400 });
  }

  const comment = await db.lessonComment.create({
    data: {
      lessonSlug: params.slug,
      clerkUserId: userId,
      userName: displayName.split(/\s+/)[0] || displayName,
      userAvatar: dbUser.avatar ?? null,
      userLevel: dbUser.level ?? 1,
      body: text,
    },
  });

  return NextResponse.json({ comment });
}
