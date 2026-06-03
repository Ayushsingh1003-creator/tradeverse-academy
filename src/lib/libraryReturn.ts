/** Query param on `/learn/[slug]` when opened from a library course. */
export const LIBRARY_RETURN_QUERY = "library";

export function buildLibraryCourseHref(courseSlug: string): string {
  return `/library/${encodeURIComponent(courseSlug.trim())}`;
}

export function buildLearnHref(lessonSlug: string, libraryCourseSlug?: string | null): string {
  const slug = lessonSlug.trim();
  const base = `/learn/${encodeURIComponent(slug)}`;
  const library = libraryCourseSlug?.trim();
  if (!library) return base;
  return `${base}?${LIBRARY_RETURN_QUERY}=${encodeURIComponent(library)}`;
}
