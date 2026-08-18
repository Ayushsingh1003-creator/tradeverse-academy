import type { LessonImageAlign } from "@/types/lessonPage";

/** Shown when no admin URL is configured for a slot. */
export const LESSON_FALLBACK_SRC = "/images/lesson-fallback.png";

/** True when an admin or content author provided an explicit image URL. */
export function hasLessonImageSrc(src?: string | null): src is string {
  return Boolean(src?.trim());
}

export function resolveLessonImageDisplaySrc(src?: string | null): { src: string; isFallback: boolean } {
  if (hasLessonImageSrc(src)) {
    return { src: src.trim(), isFallback: false };
  }
  return { src: LESSON_FALLBACK_SRC, isFallback: true };
}

/** Remote URLs and GIFs — kept for lazy-loading hint on external assets. */
export function isExternalLessonImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src) || /\.gif($|\?|#)/i.test(src);
}

export const DEFAULT_LESSON_IMAGE_WIDTH_PERCENT = 100;
export const DEFAULT_LESSON_IMAGE_ALIGN: LessonImageAlign = "left";

export function clampLessonImageWidthPercent(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_LESSON_IMAGE_WIDTH_PERCENT;
  return Math.min(100, Math.max(10, Math.round(value)));
}

export function parseLessonImageAlign(value: string | undefined): LessonImageAlign {
  if (value === "center" || value === "right") return value;
  return DEFAULT_LESSON_IMAGE_ALIGN;
}

export function lessonImageAlignClass(align: LessonImageAlign = DEFAULT_LESSON_IMAGE_ALIGN): string {
  switch (align) {
    case "center":
      return "mx-auto";
    case "right":
      return "ml-auto";
    default:
      return "mr-auto";
  }
}

/** Border only — no fixed height or dark fill; width/align set inline. */
export const LESSON_IMAGE_FRAME_CLASS = "block overflow-hidden rounded-2xl border border-white/10";
