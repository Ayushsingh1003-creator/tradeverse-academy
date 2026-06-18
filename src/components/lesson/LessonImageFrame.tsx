"use client";

import Image from "next/image";
import { useState } from "react";
import { LESSON_IMAGE_FRAME_CLASS, LESSON_PLACEHOLDER_SRC, resolveLessonImageSrc } from "@/lib/lessonImages";
import type { LessonImageRef } from "@/types/lessonPage";

type Props = LessonImageRef & {
  courseSlug?: string;
  className?: string;
  priority?: boolean;
};

export function LessonImageFrame({ alt, src, courseSlug, className = "", priority }: Props) {
  const resolved = resolveLessonImageSrc(alt, src, courseSlug);
  const [imgSrc, setImgSrc] = useState(resolved);

  return (
    <div className={`${LESSON_IMAGE_FRAME_CLASS} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        className="object-contain p-3"
        sizes="560px"
        onError={() => {
          if (imgSrc !== LESSON_PLACEHOLDER_SRC) setImgSrc(LESSON_PLACEHOLDER_SRC);
        }}
      />
    </div>
  );
}
