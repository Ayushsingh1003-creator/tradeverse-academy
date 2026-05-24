import { LESSONS, type Lesson } from "@/lib/data/lessons";

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((item) => item.slug === slug);
}

export function getLessonsBySlugs(slugs: string[]): Lesson[] {
  const wanted = new Set(slugs);
  return LESSONS.filter((lesson) => wanted.has(lesson.slug));
}
