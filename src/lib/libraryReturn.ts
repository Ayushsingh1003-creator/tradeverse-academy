/** Query param on `/learn/[slug]` when opened from a library course. */
export const LIBRARY_RETURN_QUERY = "library";

export function buildLibraryCourseHref(courseSlug: string): string {
  return `/library/${encodeURIComponent(courseSlug.trim())}`;
}

export function buildLearnHref(
  lessonSlug: string,
  libraryCourseSlug?: string | null,
  opts?: { resumeToCompletion?: boolean },
): string {
  const slug = lessonSlug.trim();
  const base = `/learn/${encodeURIComponent(slug)}`;
  const library = libraryCourseSlug?.trim();
  if (!library) return base;
  const params = new URLSearchParams({ [LIBRARY_RETURN_QUERY]: library });
  if (opts?.resumeToCompletion) params.set("resume", "completion");
  return `${base}?${params.toString()}`;
}
