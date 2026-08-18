import type { LibraryCourse } from "@/lib/data/library";
import {
  buildLibraryCoursePracticeSummary,
  type LibraryCoursePracticeSummary,
} from "@/lib/libraryProgress";
import {
  notifyLibraryProgressUpdated,
  readLocalLibraryProgress,
  saveLocalLibraryProgress,
} from "@/lib/libraryProgressLocal";

const fetchOpts: RequestInit = { credentials: "include", cache: "no-store" };

export async function postLibraryLearnProgress(payload: {
  courseSlug: string;
  learnSlug: string;
  libraryItemId?: string | null;
  practiceCorrect?: number;
  practiceTotal?: number;
  lessonCompleted?: boolean;
}): Promise<LibraryCoursePracticeSummary | null> {
  const practiceCorrect = payload.practiceCorrect ?? 0;
  const practiceTotal = payload.practiceTotal ?? 0;
  const lessonCompleted = payload.lessonCompleted ?? true;

  saveLocalLibraryProgress(payload.courseSlug, {
    learnSlug: payload.learnSlug,
    libraryItemId: payload.libraryItemId,
    practiceCorrect,
    practiceTotal,
    lessonCompleted,
  });

  try {
    const res = await fetch("/api/library/progress", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: payload.courseSlug,
        learnSlug: payload.learnSlug,
        practiceCorrect,
        practiceTotal,
        lessonCompleted,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { summary?: LibraryCoursePracticeSummary };
    if (data.summary) {
      notifyLibraryProgressUpdated(payload.courseSlug);
      return data.summary;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchLibraryCoursePracticeSummary(
  course: LibraryCourse,
): Promise<LibraryCoursePracticeSummary> {
  const localRows = readLocalLibraryProgress(course.slug);
  let summary = buildLibraryCoursePracticeSummary(course, localRows);

  try {
    const res = await fetch(
      `/api/library/progress?slug=${encodeURIComponent(course.slug)}`,
      fetchOpts,
    );
    if (res.ok) {
      const data = (await res.json()) as { summary?: LibraryCoursePracticeSummary };
      if (data.summary) summary = data.summary;
    }
  } catch {
    /* use local summary */
  }

  return summary;
}
