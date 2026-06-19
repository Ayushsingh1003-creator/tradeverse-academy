import { db } from "@/lib/db";

import {

  type LessonImageAdminConfig,

  type LessonImageRecord,

  recordToLessonImageAdminConfig,

} from "@/lib/lessonImageOverrides";



export async function fetchLessonImageConfigMap(lessonSlug: string): Promise<Record<string, LessonImageAdminConfig>> {

  try {

    const rows = (await db.lessonImage.findMany({ where: { lessonSlug } })) as LessonImageRecord[];

    return Object.fromEntries(rows.map((row) => [row.pageId, recordToLessonImageAdminConfig(row)]));

  } catch {

    return {};

  }

}



export async function fetchLessonImageRecords(lessonSlug: string): Promise<LessonImageRecord[]> {

  try {

    return (await db.lessonImage.findMany({ where: { lessonSlug } })) as LessonImageRecord[];

  } catch {

    return [];

  }

}


