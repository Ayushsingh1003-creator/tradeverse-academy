export { dynamic } from "@/lib/route-dynamic";

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { SRSCard } from "@/lib/db/schema";
import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

export async function GET() {
  const userId = await getAuthUserId();

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const reviewsDue: SRSCard[] = userId
    ? ((await db.sRSCard.findMany({
        where: { clerkUserId: userId, nextReviewDate: { lte: today } },
        take: 8,
      })) as SRSCard[])
    : [];

  const reviewLessons = reviewsDue
    .map((c: SRSCard) => LESSONS.find((l) => l.slug === c.lessonSlug))
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

