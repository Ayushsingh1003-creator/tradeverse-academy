import type { LibraryVideo } from "@/lib/data/library";
import { buildLearnHref } from "@/lib/libraryReturn";

export type LibraryItemType = "video" | "learn";

export function isLibraryLearnItem(video: LibraryVideo): boolean {
  return Boolean(video.learnSlug?.trim());
}

export function getLibraryLearnHref(
  video: LibraryVideo,
  libraryCourseSlug?: string | null,
): string | null {
  const slug = video.learnSlug?.trim();
  if (!slug) return null;
  return buildLearnHref(slug, libraryCourseSlug);
}
