import type { LibraryLearnProgressRow } from "@/lib/libraryProgress";

const PREFIX = "tv-library-progress:";

type StoredEntry = {
  learnSlug: string;
  libraryItemId: string | null;
  practiceCorrect: number;
  practiceTotal: number;
  lessonCompleted: boolean;
  updatedAt: string;
};

function storageKey(courseSlug: string) {
  return `${PREFIX}${courseSlug}`;
}

function readRaw(courseSlug: string): Record<string, StoredEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(courseSlug));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredEntry>;
  } catch {
    return {};
  }
}

function writeRaw(courseSlug: string, data: Record<string, StoredEntry>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(courseSlug), JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function notifyLibraryProgressUpdated(courseSlug: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("tv-library-progress", { detail: { courseSlug } }),
  );
}

export function readLocalLibraryProgress(courseSlug: string): LibraryLearnProgressRow[] {
  const map = readRaw(courseSlug);
  return Object.values(map).map((e) => ({
    learnSlug: e.learnSlug,
    libraryItemId: e.libraryItemId,
    practiceCorrect: e.practiceCorrect,
    practiceTotal: e.practiceTotal,
    lessonCompleted: e.lessonCompleted,
  }));
}

export function saveLocalLibraryProgress(
  courseSlug: string,
  entry: {
    learnSlug: string;
    libraryItemId?: string | null;
    practiceCorrect: number;
    practiceTotal: number;
    lessonCompleted: boolean;
  },
) {
  const map = readRaw(courseSlug);
  const prev = map[entry.learnSlug];
  map[entry.learnSlug] = {
    learnSlug: entry.learnSlug,
    libraryItemId: entry.libraryItemId ?? prev?.libraryItemId ?? null,
    practiceCorrect: Math.max(prev?.practiceCorrect ?? 0, entry.practiceCorrect),
    practiceTotal: Math.max(prev?.practiceTotal ?? 0, entry.practiceTotal),
    lessonCompleted: (prev?.lessonCompleted ?? false) || entry.lessonCompleted,
    updatedAt: new Date().toISOString(),
  };
  writeRaw(courseSlug, map);
  notifyLibraryProgressUpdated(courseSlug);
}
