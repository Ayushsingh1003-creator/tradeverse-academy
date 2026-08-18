import type { LibraryLearnProgressEntry } from "@/lib/libraryProgress";
import { readLocalLibraryProgress } from "@/lib/libraryProgressLocal";

/** Completed lesson — reopen on the splash (practice / back to course / restart). */
export function shouldResumeLessonToCompletionSplash(
  entry: Pick<LibraryLearnProgressEntry, "lessonCompleted"> | undefined,
  lessonSlug?: string,
  lessonsCompleted?: string[],
): boolean {
  if (entry?.lessonCompleted) return true;
  if (lessonSlug && lessonsCompleted?.includes(lessonSlug)) return true;
  return false;
}

export function readInitialLessonResumeState(
  libraryCourseSlug: string | undefined,
  lessonSlug: string,
  lessonsCompleted: string[],
): { phase: "lesson" | "splash"; lessonPersisted: boolean; splashFromResume: boolean } {
  if (typeof window === "undefined" || !libraryCourseSlug?.trim()) {
    return { phase: "lesson", lessonPersisted: false, splashFromResume: false };
  }
  const entry = readLocalLibraryProgress(libraryCourseSlug.trim()).find(
    (row) => row.learnSlug === lessonSlug,
  );
  if (shouldResumeLessonToCompletionSplash(entry, lessonSlug, lessonsCompleted)) {
    return { phase: "splash", lessonPersisted: true, splashFromResume: true };
  }
  return { phase: "lesson", lessonPersisted: false, splashFromResume: false };
}
