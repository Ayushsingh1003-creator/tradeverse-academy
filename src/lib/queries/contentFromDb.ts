import { db } from "@/lib/db";
import { getLibraryCourseBySlug } from "@/lib/data/library";
import { getLiveClassBySlug, getLiveClasses } from "@/lib/data/liveClasses";
import type { LibraryCourse, LibraryVideo } from "@/lib/data/library";
import type { LiveClassCourse } from "@/lib/data/liveClasses";
import { mapDbLibraryCourse, mapDbStandaloneVideo } from "@/lib/libraryDbMapper";
import { mapLiveCohortRow } from "@/lib/liveCohortMapper";

export async function getLibraryCoursesFromDb(): Promise<LibraryCourse[]> {
  try {
    const rows = await db.libraryCourse.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: { videos: { orderBy: { order: "asc" } } },
    });
    if (rows.length > 0) return rows.map(mapDbLibraryCourse);
  } catch {
    /* DB unavailable */
  }
  return [];
}

export async function getLibraryCourseBySlugFromDb(slug: string) {
  try {
    const row = await db.libraryCourse.findFirst({
      where: { slug, published: true },
      include: { videos: { orderBy: { order: "asc" } } },
    });
    if (row) return mapDbLibraryCourse(row);
  } catch {
    /* DB unavailable */
  }
  return getLibraryCourseBySlug(slug);
}

export async function getStandaloneVideosFromDb(): Promise<LibraryVideo[]> {
  try {
    const rows = await db.libraryStandaloneVideo.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    if (rows.length > 0) return rows.map(mapDbStandaloneVideo);
  } catch {
    /* DB unavailable */
  }
  return [];
}

export async function getLiveClassesFromDb(): Promise<LiveClassCourse[]> {
  try {
    const rows = await db.liveCohort.findMany({
      where: { status: "published" },
      orderBy: { startDate: "asc" },
    });
    if (rows.length > 0) return rows.map(mapLiveCohortRow);
  } catch {
    /* DB unavailable */
  }
  return getLiveClasses();
}

export async function getLiveClassBySlugFromDb(slug: string) {
  try {
    const row = await db.liveCohort.findFirst({
      where: { slug, status: "published" },
    });
    if (row) return mapLiveCohortRow(row);
  } catch {
    /* ignore */
  }
  return getLiveClassBySlug(slug);
}
