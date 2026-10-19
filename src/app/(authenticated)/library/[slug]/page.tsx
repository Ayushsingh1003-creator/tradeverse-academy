import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LibraryCoursePlayerClient } from "@/components/library/LibraryCoursePlayerClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { getLibraryCourseBySlugFromDb } from "@/lib/queries/contentFromDb";
import { getLibraryCoursePracticeSummaryForUser } from "@/lib/queries/libraryProgress";
import { resolveUserForAuth } from "@/lib/server/resolveDbUser";

type PageProps = {
  params: { slug: string };
  searchParams: { v?: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getLibraryCourseBySlugFromDb(params.slug);
  if (!course) return { title: "Course | Library" };
  const description =
    course.description.length > 160 ? `${course.description.slice(0, 157)}...` : course.description;
  return {
    title: `${course.title} | Library`,
    description,
  };
}

function CoursePlayerFallback() {
  return (
    <main className="tvapp min-h-screen px-4 py-24 text-center text-sm text-[color:var(--tv-mute)]">
      Loading course…
    </main>
  );
}

export const dynamic = "force-dynamic";

export default async function LibraryCoursePage({ params, searchParams }: PageProps) {
  const course = await getLibraryCourseBySlugFromDb(params.slug);
  if (!course) notFound();
  const v = typeof searchParams.v === "string" ? searchParams.v : null;

  let initialPracticeSummary = null;
  if (isAuthConfigured()) {
    // Course playback tracks progress against an account — signed-out visitors
    // are sent to sign in and returned here afterwards.
    const userId = await getAuthUserId();
    if (!userId) {
      redirect(`${AUTH_SIGN_IN_URL}?redirect_url=${encodeURIComponent(`/library/${params.slug}`)}`);
    }
    const email = await getAuthUserEmail();
    const dbUser = await resolveUserForAuth(userId, email);
    if (dbUser) {
      initialPracticeSummary = await getLibraryCoursePracticeSummaryForUser(dbUser.id, course);
    }
  }

  return (
    <Suspense fallback={<CoursePlayerFallback />}>
      <LibraryCoursePlayerClient
        course={course}
        initialVideoId={v}
        initialPracticeSummary={initialPracticeSummary}
      />
    </Suspense>
  );
}
