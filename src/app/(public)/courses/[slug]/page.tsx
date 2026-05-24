import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";
import { COURSES } from "@/lib/data/courses";
import { getLessonsBySlugs } from "@/lib/data/lessonLookup";

const CourseDetailPage = dynamic(
  () => import("@/components/courses/CourseDetailPage").then((m) => m.CourseDetailPage),
  { loading: () => <PageLoader className="min-h-[60vh]" /> },
);

export const revalidate = 300;

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export default function CoursePage({ params }: { params: { slug: string } }) {
  const course = COURSES.find((c) => c.slug === params.slug);
  if (!course) notFound();
  const courseLessons = getLessonsBySlugs(course.lessonSlugs);
  return <CourseDetailPage course={course} allLessons={courseLessons} />;
}