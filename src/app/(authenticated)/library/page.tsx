import { LibraryPageClient } from "@/components/library/LibraryPageClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import type { LibraryCourse, LibraryResumeItem } from "@/lib/data/library";
import { getLibraryCoursesFromDb, getStandaloneVideosFromDb } from "@/lib/queries/contentFromDb";
import { computeLibraryCourseCardProgress } from "@/lib/libraryCourseProgress";
import { getLibraryEnrollmentsForUser } from "@/lib/queries/libraryEnrollments";
import { getLibraryCourseProgressMapForUser } from "@/lib/queries/libraryProgress";
import { resolveUserForAuth } from "@/lib/server/resolveDbUser";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const courses = await getLibraryCoursesFromDb();
  const standaloneVideos = await getStandaloneVideosFromDb();
  const tagSet = new Set<string>();
  for (const c of courses) {
    c.tags.forEach((t) => tagSet.add(t));
    for (const v of c.videos) v.tags.forEach((t) => tagSet.add(t));
  }
  for (const v of standaloneVideos) v.tags.forEach((t) => tagSet.add(t));
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  const resumeItems: LibraryResumeItem[] = [];
  const courseProgressBySlug: Record<string, ReturnType<typeof computeLibraryCourseCardProgress>> =
    {};

  for (const course of courses) {
    courseProgressBySlug[course.slug] = computeLibraryCourseCardProgress(course);
  }

  if (isAuthConfigured()) {
    const userId = await getAuthUserId();
    if (userId) {
      const email = await getAuthUserEmail();
      const dbUser = await resolveUserForAuth(userId, email);
      if (dbUser) {
        const enrollments = await getLibraryEnrollmentsForUser(dbUser.id);
        const lastVideoIdBySlug: Record<string, string | null> = {};
        const bySlug = new Map<string, LibraryCourse>(courses.map((c) => [c.slug, c]));
        for (const e of enrollments) {
          lastVideoIdBySlug[e.courseSlug] = e.lastVideoId;
          const course = bySlug.get(e.courseSlug);
          if (!course || !course.videos.length) continue;
          resumeItems.push({ course, lastVideoId: e.lastVideoId });
        }
        const progressMap = await getLibraryCourseProgressMapForUser(
          dbUser.id,
          courses,
          lastVideoIdBySlug,
        );
        Object.assign(courseProgressBySlug, progressMap);
      }
    }
  }

  return (
    <LibraryPageClient
      courses={courses}
      standaloneVideos={standaloneVideos}
      tags={tags}
      resumeItems={resumeItems}
      courseProgressBySlug={courseProgressBySlug}
    />
  );
}
