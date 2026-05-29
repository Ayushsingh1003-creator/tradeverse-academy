import { requireDbUser } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLibraryCourseBySlugFromDb } from "@/lib/queries/contentFromDb";

export async function POST(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  let body: { slug?: string; lastVideoId?: string | null };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().slice(0, 200) : "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const lastVideoIdRaw = body.lastVideoId;
  const lastVideoId =
    lastVideoIdRaw === undefined
      ? undefined
      : lastVideoIdRaw === null
        ? null
        : typeof lastVideoIdRaw === "string"
          ? lastVideoIdRaw.trim().slice(0, 128) || null
          : null;

  
  const course = await getLibraryCourseBySlugFromDb(slug);
  if (!course?.videos?.length) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (lastVideoId !== undefined && lastVideoId !== null) {
    const valid = course.videos.some((v) => v.id === lastVideoId);
    if (!valid) return NextResponse.json({ error: "Invalid video" }, { status: 400 });
  }

  const existing = await db.libraryCourseEnrollment.findUnique({
    where: {
      userId_courseSlug: { userId: dbUser.id, courseSlug: slug },
    },
  });
  if (!existing) {
    await db.libraryCourseEnrollment.create({
      data: {
        userId: dbUser.id,
        courseSlug: slug,
        lastVideoId: lastVideoId ?? null,
      },
    });
  } else if (lastVideoId !== undefined) {
    await db.libraryCourseEnrollment.update({
      where: { id: existing.id },
      data: { lastVideoId },
    });
  }

  return NextResponse.json({ ok: true });
}
