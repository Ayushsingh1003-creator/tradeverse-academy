import { db } from "@/lib/db";
import type { LibraryCourse } from "@/lib/data/library";
import {
  computeLibraryCourseCardProgress,
  type LibraryCourseCardProgress,
} from "@/lib/libraryCourseProgress";
import {
  buildLibraryCoursePracticeSummary,
  type LibraryCoursePracticeSummary,
  type LibraryLearnProgressRow,
} from "@/lib/libraryProgress";

export async function getLibraryCoursePracticeSummaryForUser(
  userId: string,
  course: LibraryCourse,
): Promise<LibraryCoursePracticeSummary> {
  try {
    const rows = (await db.libraryLearnProgress.findMany({
      where: { userId, courseSlug: course.slug },
    })) as Array<{
      learnSlug: string;
      libraryItemId: string | null;
      practiceCorrect: number;
      practiceTotal: number;
      lessonCompleted: boolean;
    }>;

    const mapped: LibraryLearnProgressRow[] = rows.map((r) => ({
      learnSlug: r.learnSlug,
      libraryItemId: r.libraryItemId,
      practiceCorrect: r.practiceCorrect,
      practiceTotal: r.practiceTotal,
      lessonCompleted: r.lessonCompleted,
    }));

    return buildLibraryCoursePracticeSummary(course, mapped);
  } catch {
    return buildLibraryCoursePracticeSummary(course, []);
  }
}

export async function getLibraryCourseProgressMapForUser(
  userId: string,
  courses: LibraryCourse[],
  lastVideoIdBySlug: Record<string, string | null>,
): Promise<Record<string, LibraryCourseCardProgress>> {
  let rowsByCourse = new Map<string, LibraryLearnProgressRow[]>();

  try {
    const rows = (await db.libraryLearnProgress.findMany({
      where: { userId },
    })) as Array<{
      courseSlug: string;
      learnSlug: string;
      libraryItemId: string | null;
      practiceCorrect: number;
      practiceTotal: number;
      lessonCompleted: boolean;
    }>;

    rowsByCourse = new Map();
    for (const r of rows) {
      const list = rowsByCourse.get(r.courseSlug) ?? [];
      list.push({
        learnSlug: r.learnSlug,
        libraryItemId: r.libraryItemId,
        practiceCorrect: r.practiceCorrect,
        practiceTotal: r.practiceTotal,
        lessonCompleted: r.lessonCompleted,
      });
      rowsByCourse.set(r.courseSlug, list);
    }
  } catch {
    rowsByCourse = new Map();
  }

  const out: Record<string, LibraryCourseCardProgress> = {};
  for (const course of courses) {
    const learnRows = rowsByCourse.get(course.slug) ?? [];
    const practiceSummary = buildLibraryCoursePracticeSummary(course, learnRows);
    out[course.slug] = computeLibraryCourseCardProgress(course, {
      lastVideoId: lastVideoIdBySlug[course.slug] ?? null,
      practiceSummary,
    });
  }
  return out;
}
