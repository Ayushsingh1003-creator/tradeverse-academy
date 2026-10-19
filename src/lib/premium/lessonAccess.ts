import { COURSES } from "@/lib/data/courses";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { getAuthUserId } from "@/lib/auth/session";
import { resolvePremiumStatus } from "@/lib/premium/resolvePremiumStatus";
import { ANATOMY_LESSON_SLUG } from "@/components/lesson/anatomy-of-a-candle/constants";
import { CHART_PATTERNS_LESSON_SLUG } from "@/components/lesson/chart-patterns/constants";
import { SUPPORT_RESISTANCE_LESSON_SLUG } from "@/components/lesson/support-resistance/constants";
import { TIME_FRAMES_LESSON_SLUG } from "@/components/lesson/timeframes/constants";
import { TREND_LINES_LESSON_SLUG } from "@/components/lesson/trend-lines/constants";

export const FREE_COURSE_SLUG = "candlestick-essentials";

/** The 5 bespoke Candlestick Essentials lessons never go through getLessonBySlug/COURSES lookup — they're always free. */
const BESPOKE_FREE_LESSON_SLUGS = new Set([
  ANATOMY_LESSON_SLUG,
  SUPPORT_RESISTANCE_LESSON_SLUG,
  TREND_LINES_LESSON_SLUG,
  TIME_FRAMES_LESSON_SLUG,
  CHART_PATTERNS_LESSON_SLUG,
]);

export async function requestorIsPremium(): Promise<boolean> {
  const userId = await getAuthUserId();
  const { isPremium } = await resolvePremiumStatus(userId);
  return isPremium;
}

/**
 * True if this lesson belongs to a Premium course and the current requester
 * doesn't have Premium — same rule `learn/[slug]/page.tsx` uses to gate the
 * lesson page itself, reused here so voice-clip access can't be more
 * permissive than the lesson content it belongs to.
 */
export async function isLessonGatedForRequester(lessonSlug: string): Promise<boolean> {
  if (BESPOKE_FREE_LESSON_SLUGS.has(lessonSlug)) return false;

  const baseLesson = getLessonBySlug(lessonSlug);
  if (!baseLesson) return true; // unknown lesson — deny rather than leak

  const course = COURSES.find((c) => c.id === baseLesson.courseId);
  if (!course || course.slug === FREE_COURSE_SLUG) return false;

  return !(await requestorIsPremium());
}
