import type { LibraryCourse } from "@/lib/data/library";
import { isLibraryLearnItem } from "@/lib/libraryItemType";

export type LibraryLearnProgressRow = {
  learnSlug: string;
  libraryItemId: string | null;
  practiceCorrect: number;
  practiceTotal: number;
  lessonCompleted: boolean;
};

export type LibraryLearnProgressEntry = {
  learnSlug: string;
  libraryItemId: string | null;
  title: string;
  practiceCorrect: number;
  practiceTotal: number;
  lessonCompleted: boolean;
  practicePercent: number | null;
};

export type LibraryCoursePracticeSummary = {
  learnItemCount: number;
  lessonCompletedCount: number;
  practicedCount: number;
  totalPracticeCorrect: number;
  totalPracticeQuestions: number;
  practiceScorePercent: number | null;
  entries: LibraryLearnProgressEntry[];
};

export function buildLibraryCoursePracticeSummary(
  course: LibraryCourse,
  rows: LibraryLearnProgressRow[],
): LibraryCoursePracticeSummary {
  const learnVideos = course.videos.filter(isLibraryLearnItem);
  const bySlug = new Map(rows.map((r) => [r.learnSlug, r]));

  const entries: LibraryLearnProgressEntry[] = learnVideos.map((v) => {
    const slug = v.learnSlug!.trim();
    const row = bySlug.get(slug);
    const practiceCorrect = row?.practiceCorrect ?? 0;
    const practiceTotal = row?.practiceTotal ?? 0;
    const lessonCompleted = row?.lessonCompleted ?? false;
    const practicePercent =
      practiceTotal > 0 ? Math.round((practiceCorrect / practiceTotal) * 100) : null;

    return {
      learnSlug: slug,
      libraryItemId: row?.libraryItemId ?? v.id,
      title: v.title,
      practiceCorrect,
      practiceTotal,
      lessonCompleted,
      practicePercent,
    };
  });

  let totalPracticeCorrect = 0;
  let totalPracticeQuestions = 0;
  let practicedCount = 0;
  let lessonCompletedCount = 0;

  for (const e of entries) {
    if (e.lessonCompleted) lessonCompletedCount += 1;
    if (e.practiceTotal > 0) {
      practicedCount += 1;
      totalPracticeCorrect += e.practiceCorrect;
      totalPracticeQuestions += e.practiceTotal;
    }
  }

  const practiceScorePercent =
    totalPracticeQuestions > 0
      ? Math.round((totalPracticeCorrect / totalPracticeQuestions) * 100)
      : null;

  return {
    learnItemCount: learnVideos.length,
    lessonCompletedCount,
    practicedCount,
    totalPracticeCorrect,
    totalPracticeQuestions,
    practiceScorePercent,
    entries,
  };
}
