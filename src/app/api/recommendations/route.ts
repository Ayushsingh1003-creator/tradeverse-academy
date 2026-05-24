import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

export async function GET() {
  const { userId } = await auth();

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const reviewsDue =
    userId
      ? await db.sRSCard.findMany({
          where: { clerkUserId: userId, nextReviewDate: { lte: today } },
          take: 8,
        })
      : [];

  const reviewLessons = reviewsDue
    .map((c) => LESSONS.find((l) => l.slug === c.lessonSlug))
    .filter(Boolean)
    .map((l) => ({ slug: l!.slug, title: l!.title }));

  const nextLesson = LESSONS.find((l) => l.slug === "what-is-a-candlestick") ?? LESSONS[0];
  const weakSlugs = ["support-and-resistance"].filter((s) => LESSONS.some((l) => l.slug === s));
  const weakAreaPractice = weakSlugs
    .map((slug) => LESSONS.find((l) => l.slug === slug))
    .filter(Boolean)
    .map((l) => ({ slug: l!.slug, title: l!.title }));

  const weeklyGoal = { target: 5, completed: 2 };

  return NextResponse.json({
    reviewsDue: reviewLessons,
    weakAreaPractice,
    nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
    weeklyGoal,
    courseTitle: COURSES[0]?.title ?? "Trading Foundations",
  });
}
