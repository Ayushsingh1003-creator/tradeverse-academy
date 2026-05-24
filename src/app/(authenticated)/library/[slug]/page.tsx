import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryCoursePlayerClient } from "@/components/library/LibraryCoursePlayerClient";
import { getLibraryCourseBySlugFromDb } from "@/lib/queries/contentFromDb";

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
    <main className="min-h-screen bg-[#141414] px-4 py-24 text-center text-sm text-text-muted">
      Loading course…
    </main>
  );
}

export default async function LibraryCoursePage({ params, searchParams }: PageProps) {
  const course = await getLibraryCourseBySlugFromDb(params.slug);
  if (!course) notFound();
  const v = typeof searchParams.v === "string" ? searchParams.v : null;
  return (
    <Suspense fallback={<CoursePlayerFallback />}>
      <LibraryCoursePlayerClient course={course} initialVideoId={v} />
    </Suspense>
  );
}
