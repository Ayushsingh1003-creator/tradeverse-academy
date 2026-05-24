import Link from "next/link";
import { LESSONS } from "@/lib/data/lessons";
import { COURSES } from "@/lib/data/courses";

export default function AdminLessonsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Lessons</h1>
          <p className="mt-1 text-sm text-[#666]">
            Interactive lesson content lives in <code className="text-[#88C9F7]">src/lib/data/lessons/</code>. Use
            this page to preview and attach Mux intro videos.
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="rounded-xl border border-white/10 bg-[#1E1E1E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.05]"
        >
          View courses
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1E1E1E]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-[#555]">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="py-3">Course</th>
              <th className="py-3">Slug</th>
              <th className="py-3">XP</th>
              <th className="py-3">Access</th>
              <th className="py-3">Pages</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {LESSONS.map((lesson) => {
              const course = COURSES.find((c) => c.id === lesson.courseId);
              return (
                <tr key={lesson.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium">{lesson.title}</td>
                  <td className="py-3 text-[#999]">{course?.title ?? "—"}</td>
                  <td className="py-3 font-mono text-xs text-[#666]">{lesson.slug}</td>
                  <td className="py-3 text-[#F7C325]">{lesson.xpReward}</td>
                  <td className="py-3">{lesson.isFree ? "Free" : "Premium"}</td>
                  <td className="py-3 text-[#666]">{lesson.pages.length}</td>
                  <td className="py-3">
                    <Link href={`/admin/lessons/${lesson.id}`} className="text-[#456DFF] hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
