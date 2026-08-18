import type { Lesson } from "@/lib/data/lessons/candlestickBundle";

import type { lessonImages } from "@/lib/db/schema";

import {

  clampLessonImageWidthPercent,

  DEFAULT_LESSON_IMAGE_ALIGN,

  DEFAULT_LESSON_IMAGE_WIDTH_PERCENT,

  parseLessonImageAlign,

} from "@/lib/lessonImages";

import type { LessonImageRef, LessonImageAlign, LessonPage } from "@/types/lessonPage";



export type LessonImageRecord = typeof lessonImages.$inferSelect;



export type LessonImageAdminConfig = {

  url?: string | null;

  widthPercent: number;

  align: LessonImageAlign;

};



export type LessonImageSlot = {

  pageId: string;

  alt: string;

  section: "page" | "practice";

  context: string;

};



function getPageImage(page: LessonPage): LessonImageRef | undefined {

  if (page.type === "image") return { alt: page.alt, src: page.src };

  if ("image" in page && page.image) return page.image;

  return undefined;

}



export function normalizeLessonImageAdminConfig(

  partial?: Partial<LessonImageAdminConfig> | null,

): LessonImageAdminConfig {

  return {

    url: partial?.url?.trim() || undefined,

    widthPercent: clampLessonImageWidthPercent(partial?.widthPercent),

    align: parseLessonImageAlign(partial?.align),

  };

}



export function recordToLessonImageAdminConfig(row: LessonImageRecord): LessonImageAdminConfig {

  return normalizeLessonImageAdminConfig({

    url: row.url,

    widthPercent: row.widthPercent,

    align: row.align as LessonImageAlign,

  });

}



function patchImageRef(image: LessonImageRef, config: LessonImageAdminConfig): LessonImageRef {

  return {

    ...image,

    ...(config.url ? { src: config.url } : {}),

    widthPercent: config.widthPercent,

    align: config.align,

  };

}



function patchImagePage(page: Extract<LessonPage, { type: "image" }>, config: LessonImageAdminConfig) {

  const patched = patchImageRef({ alt: page.alt, src: page.src }, config);

  return { ...page, ...patched };

}



/** Every lesson page / practice question that references an image slot. */

export function collectLessonImageSlots(lesson: Lesson): LessonImageSlot[] {

  const slots: LessonImageSlot[] = [];



  for (const page of lesson.pages) {

    const image = getPageImage(page);

    if (image) {

      slots.push({

        pageId: page.id,

        alt: image.alt,

        section: "page",

        context: page.type,

      });

    }

  }



  for (const question of lesson.practice ?? []) {

    if (question.image) {

      slots.push({

        pageId: question.id,

        alt: question.image.alt,

        section: "practice",

        context: question.type,

      });

    }

  }



  return slots;

}



export function applyLessonImageConfigMap(

  lesson: Lesson,

  configByPageId: Record<string, LessonImageAdminConfig>,

): Lesson {

  const configFor = (pageId: string) => configByPageId[pageId];



  const pages = lesson.pages.map((page) => {

    const config = configFor(page.id);

    if (!config) return page;



    if (page.type === "image") {

      return patchImagePage(page, config);

    }



    if ("image" in page && page.image) {

      return { ...page, image: patchImageRef(page.image, config) };

    }



    return page;

  });



  const practice = lesson.practice?.map((question) => {

    const config = configFor(question.id);

    if (!config || !question.image) return question;

    return { ...question, image: patchImageRef(question.image, config) };

  });



  return { ...lesson, pages, practice };

}



/** Defaults when no admin row exists for a slot. */

export const DEFAULT_LESSON_IMAGE_ADMIN_CONFIG: LessonImageAdminConfig = {

  widthPercent: DEFAULT_LESSON_IMAGE_WIDTH_PERCENT,

  align: DEFAULT_LESSON_IMAGE_ALIGN,

};


