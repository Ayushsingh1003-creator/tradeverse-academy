/** Slugify alt text into a stable filename (swap PNGs in public without touching lesson data). */
export function altToImageSlug(alt: string): string {
  return alt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve lesson image path from alt; override with explicit src when needed. */
export function resolveLessonImageSrc(alt: string, src?: string, courseSlug = "candlestick-essentials"): string {
  if (src) return src;
  return `/images/courses/${courseSlug}/${altToImageSlug(alt)}.png`;
}

/** Fallback when a lesson image file is missing — swap per-course art later via alt paths. */
export const LESSON_PLACEHOLDER_SRC = "/images/lesson-placeholder.png";

/** Shared frame sizing — keep every lesson image slot identical. */
export const LESSON_IMAGE_FRAME_CLASS =
  "relative mx-auto h-[200px] w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]";
