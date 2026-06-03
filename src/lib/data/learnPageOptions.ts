import { LESSONS } from "@/lib/data/lessons";
import { getLessonBySlug } from "@/lib/data/lessonLookup";

/** All slugs for `/learn/[slug]` pages, sorted by lesson title. */
export const LEARN_PAGE_OPTIONS = [...LESSONS]
  .map((lesson) => ({ slug: lesson.slug, title: lesson.title }))
  .sort((a, b) => a.title.localeCompare(b.title));

export function getLearnPageTitle(slug: string): string | undefined {
  return getLessonBySlug(slug)?.title;
}
