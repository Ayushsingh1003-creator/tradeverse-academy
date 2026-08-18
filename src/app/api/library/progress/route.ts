import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { getLibraryCourseBySlugFromDb } from "@/lib/queries/contentFromDb";
import { getLibraryCoursePracticeSummaryForUser } from "@/lib/queries/libraryProgress";
import { isLibraryLearnItem } from "@/lib/libraryItemType";

type ProgressBody = {
  courseSlug?: string;
  learnSlug?: string;
  practiceCorrect?: number;
  practiceTotal?: number;
  lessonCompleted?: boolean;
};

export async function GET(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  const slug = req.nextUrl.searchParams.get("slug")?.trim().slice(0, 200) ?? "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const course = await getLibraryCourseBySlugFromDb(slug);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const summary = await getLibraryCoursePracticeSummaryForUser(dbUser.id, course);
  return NextResponse.json({ summary });
}

export async function POST(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  let body: ProgressBody;
  try {
    body = (await req.json()) as ProgressBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug.trim().slice(0, 200) : "";
  const learnSlug = typeof body.learnSlug === "string" ? body.learnSlug.trim().slice(0, 200) : "";
  if (!courseSlug || !learnSlug) {
    return NextResponse.json({ error: "Missing courseSlug or learnSlug" }, { status: 400 });
  }

  const course = await getLibraryCourseBySlugFromDb(courseSlug);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const learnItem = course.videos.find(
    (v) => isLibraryLearnItem(v) && v.learnSlug?.trim() === learnSlug,
  );
  if (!learnItem) {
    return NextResponse.json({ error: "Learn item not in course" }, { status: 400 });
  }

  const practiceCorrect = Math.max(0, Math.min(Number(body.practiceCorrect) || 0, 500));
  const practiceTotal = Math.max(0, Math.min(Number(body.practiceTotal) || 0, 500));
  const lessonCompleted = Boolean(body.lessonCompleted);
  const safeTotal = practiceTotal >= practiceCorrect ? practiceTotal : practiceCorrect;

  const existing = await db.libraryLearnProgress.findFirst({
    where: { userId: dbUser.id, courseSlug, learnSlug },
  });

  const data = {
    libraryItemId: learnItem.id,
    practiceCorrect,
    practiceTotal: safeTotal,
    lessonCompleted,
    updatedAt: new Date(),
  };

  if (!existing) {
    await db.libraryLearnProgress.create({
      data: {
        userId: dbUser.id,
        courseSlug,
        learnSlug,
        ...data,
      },
    });
  } else {
    const merged = {
      practiceCorrect: Math.max(existing.practiceCorrect, practiceCorrect),
      practiceTotal: Math.max(existing.practiceTotal, safeTotal),
      lessonCompleted: existing.lessonCompleted || lessonCompleted,
      libraryItemId: learnItem.id,
      updatedAt: new Date(),
    };
    await db.libraryLearnProgress.update({
      where: { id: existing.id },
      data: merged,
    });
  }

  const enrollment = await db.libraryCourseEnrollment.findFirst({
    where: { userId: dbUser.id, courseSlug },
  });
  if (!enrollment) {
    await db.libraryCourseEnrollment.create({
      data: { userId: dbUser.id, courseSlug, lastVideoId: learnItem.id },
    });
  } else {
    await db.libraryCourseEnrollment.update({
      where: { id: enrollment.id },
      data: { lastVideoId: learnItem.id },
    });
  }

  const summary = await getLibraryCoursePracticeSummaryForUser(dbUser.id, course);
  return NextResponse.json({ ok: true, summary });
}
