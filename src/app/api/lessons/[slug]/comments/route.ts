import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "helpful";
  const { userId } = await auth();

  const comments = await db.lessonComment.findMany({
    where: { lessonSlug: params.slug },
    include: { replies: { orderBy: { createdAt: "asc" } } },
    orderBy: sort === "newest" ? { createdAt: "desc" } : { upvotes: "desc" },
    take: 50,
  });

  const filtered =
    sort === "mine" && userId ? comments.filter((c) => c.clerkUserId === userId) : comments;

  const pinned = filtered.filter((c) => c.pinned);
  const rest = filtered.filter((c) => !c.pinned);
  const ordered = [...pinned, ...rest];

  return NextResponse.json({ comments: ordered });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const body = (await request.json()) as { body?: string };
  const text = (body.body ?? "").trim();
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "Comment must be 1–500 characters" }, { status: 400 });
  }

  const comment = await db.lessonComment.create({
    data: {
      lessonSlug: params.slug,
      clerkUserId: userId,
      userName: user?.firstName || user?.username || "Trader",
      userAvatar: user?.imageUrl ?? null,
      userLevel: 1,
      body: text,
    },
  });

  return NextResponse.json({ comment });
}
