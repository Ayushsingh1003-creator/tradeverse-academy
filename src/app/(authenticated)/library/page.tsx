import { auth, currentUser } from "@clerk/nextjs/server";
import { LibraryPageClient } from "@/components/library/LibraryPageClient";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import type { LibraryCourse, LibraryResumeItem } from "@/lib/data/library";
import { getStandaloneVideos } from "@/lib/data/library";
import { getLibraryEnrollmentsForUser } from "@/lib/queries/libraryEnrollments";
import { getLibraryCoursesFromDb } from "@/lib/queries/contentFromDb";
import { resolveUserForClerk } from "@/lib/server/resolveDbUser";

export default async function LibraryPage() {
  const courses = await getLibraryCoursesFromDb();
  const standaloneVideos = getStandaloneVideos();
  const tagSet = new Set<string>();
  for (const c of courses) {
    c.tags.forEach((t) => tagSet.add(t));
    for (const v of c.videos) v.tags.forEach((t) => tagSet.add(t));
  }
  for (const v of standaloneVideos) v.tags.forEach((t) => tagSet.add(t));
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  const resumeItems: LibraryResumeItem[] = [];
  if (isClerkConfigured()) {
    const { userId } = await auth();
    if (userId) {
      const clerk = await currentUser();
      const email = clerk?.primaryEmailAddress?.emailAddress ?? null;
      const dbUser = await resolveUserForClerk(userId, email);
      if (dbUser) {
        const enrollments = await getLibraryEnrollmentsForUser(dbUser.id);
        const bySlug = new Map<string, LibraryCourse>(courses.map((c) => [c.slug, c]));
        for (const e of enrollments) {
          const course = bySlug.get(e.courseSlug);
          if (!course || !course.videos.length) continue;
          resumeItems.push({ course, lastVideoId: e.lastVideoId });
        }
      }
    }
  }

  return (
    <LibraryPageClient
      courses={courses}
      standaloneVideos={standaloneVideos}
      tags={tags}
      resumeItems={resumeItems}
    />
  );
}
