import type { LibraryCourse } from "@/lib/data/library";
import { isLibraryLearnItem } from "@/lib/libraryItemType";
import type { LibraryCoursePracticeSummary } from "@/lib/libraryProgress";

export type LibraryCourseCardProgress = {
  totalItems: number;
  completedCount: number;
  percent: number;
  statusLabel: string;
};

export function formatLibraryCourseProgressMeta(total: number, completed: number): string {
  const remaining = Math.max(total - completed, 0);
  if (total === 0) return "Coming soon";
  if (completed === 0) return "Start course";
  if (remaining === 0) return "Completed";
  if (remaining === 1) return "1 lesson left";
  return `${remaining} lessons left`;
}

export function computeLibraryCourseCardProgress(
  course: LibraryCourse,
  opts: {
    lastVideoId?: string | null;
    practiceSummary?: LibraryCoursePracticeSummary | null;
  } = {},
): LibraryCourseCardProgress {
  const total = course.videos.length;
  if (total === 0) {
    return {
      totalItems: 0,
      completedCount: 0,
      percent: 0,
      statusLabel: "Coming soon",
    };
  }

  const learnBySlug = new Map(
    (opts.practiceSummary?.entries ?? []).map((e) => [e.learnSlug, e]),
  );

  let lastIndex = -1;
  const lastVideoId = opts.lastVideoId?.trim();
  if (lastVideoId) {
    lastIndex = course.videos.findIndex((v) => v.id === lastVideoId);
  }

  let completedCount = 0;
  course.videos.forEach((video, index) => {
    if (isLibraryLearnItem(video)) {
      const slug = video.learnSlug!.trim();
      if (learnBySlug.get(slug)?.lessonCompleted) completedCount += 1;
      return;
    }
    if (lastIndex >= index) completedCount += 1;
  });

  const percent = Math.round((completedCount / total) * 100);

  return {
    totalItems: total,
    completedCount,
    percent,
    statusLabel: formatLibraryCourseProgressMeta(total, completedCount),
  };
}
