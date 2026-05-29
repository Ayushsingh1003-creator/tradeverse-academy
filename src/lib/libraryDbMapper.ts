import type { LibraryCourse, LibraryVideo } from "@/lib/data/library";
import type { LibraryCourse as DbCourse, LibraryVideo as DbVideo } from "@/lib/db/schema";

function parseTags(json: string): string[] {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

export function mapDbVideo(v: DbVideo, courseId: string): LibraryVideo {
  return {
    id: v.id,
    youtubeVideoId: v.youtubeVideoId,
    title: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    duration: v.duration,
    publishedAt: v.publishedAt,
    tags: parseTags(v.tags),
    courseId,
  };
}

export function mapDbLibraryCourse(row: DbCourse & { videos?: DbVideo[] }): LibraryCourse {
  const videos = [...(row.videos ?? [])].sort((a, b) => a.order - b.order).map((v) => mapDbVideo(v, row.id));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnailUrl,
    level: row.level as LibraryCourse["level"],
    tags: parseTags(row.tags),
    estimatedDurationMin: row.estimatedDurationMin,
    videos,
  };
}
