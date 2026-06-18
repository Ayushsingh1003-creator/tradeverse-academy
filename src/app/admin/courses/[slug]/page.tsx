import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES } from "@/lib/data/courses";
import { LESSONS, type Lesson } from "@/lib/data/lessons";

export default function AdminCourseDetailPage({ params }: { params: { slug: string } }) {
  const course = COURSES.find((c) => c.slug === params.slug);
  if (!course) notFound();
  const lessons: Lesson[] = course.lessonSlugs
    .map((slug) => LESSONS.find((l) => l.slug === slug))
    .filter((l): l is Lesson => Boolean(l));

  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-[#666] hover:text-white">
        ← Courses
      </Link>
      <div className="mt-4 flex items-start gap-4">
        <span className="text-4xl">{course.illustrationEmoji}</span>
        <div>
          <h1 className="text-2xl font-black">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#999]">{course.description}</p>
          <p className="mt-2 text-xs text-[#555]">
            Slug: {course.slug} · Path: {course.pathSlug} · XP reward: {course.xpReward} · Premium:{" "}
            {course.premium ? "yes" : "no"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-5">
        <h2 className="mb-4 font-bold">Lesson order</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-[#999]">
          {lessons.map((lesson) => (
            <li key={lesson.slug}>
              {lesson.title}{" "}
              <Link className="text-[#456DFF] hover:underline" href={`/admin/lessons/${lesson.id}`}>
                edit
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-bold">Lessons in this course</h2>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-xs uppercase text-[#555]">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="py-3">Slug</th>
                <th className="py-3">XP</th>
                <th className="py-3">Free</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.slug} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/lessons/${l.id}`} className="text-[#456DFF] hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="py-3 text-[#666]">{l.slug}</td>
                  <td className="py-3 text-[#F7C325]">{l.xpReward}</td>
                  <td className="py-3">{l.isFree ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
