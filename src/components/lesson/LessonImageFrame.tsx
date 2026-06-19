"use client";

import {
  clampLessonImageWidthPercent,
  DEFAULT_LESSON_IMAGE_ALIGN,
  DEFAULT_LESSON_IMAGE_WIDTH_PERCENT,
  isExternalLessonImageSrc,
  LESSON_IMAGE_FRAME_CLASS,
  lessonImageAlignClass,
  resolveLessonImageDisplaySrc,
} from "@/lib/lessonImages";
import type { LessonImageRef } from "@/types/lessonPage";

type Props = LessonImageRef & {
  className?: string;
};

export function LessonImageFrame({
  alt,
  src,
  className = "",
  widthPercent = DEFAULT_LESSON_IMAGE_WIDTH_PERCENT,
  align = DEFAULT_LESSON_IMAGE_ALIGN,
}: Props) {
  const { src: displaySrc, isFallback } = resolveLessonImageDisplaySrc(src);
  const width = clampLessonImageWidthPercent(widthPercent);
  const wrapperClass = isFallback
    ? `block ${lessonImageAlignClass(align)} ${className}`
    : `${LESSON_IMAGE_FRAME_CLASS} ${lessonImageAlignClass(align)} ${className}`;

  return (
    <div className={wrapperClass} style={{ width: `${width}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt={alt}
        className="block h-auto w-full object-contain"
        loading={!isFallback && isExternalLessonImageSrc(displaySrc) ? "lazy" : undefined}
      />
    </div>
  );
}