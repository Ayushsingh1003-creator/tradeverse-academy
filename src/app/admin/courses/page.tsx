import Link from "next/link";
import { COURSES, LEARNING_PATHS } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

export default function AdminCoursesPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Courses</h1>
          <p className="mt-1 text-sm text-[#666]">
            Lesson content lives in <code className="text-[#456DFF]">src/lib/data/</code> — edit in code. This panel is
            read-only metadata and links.
          </p>
        </div>
      </div>

      {LEARNING_PATHS.map((path) => {
        const pathCourses = COURSES.filter((c) => c.pathSlug === path.slug);
        return (
          <div key={path.id} className="mb-8">
            <h2 className="mb-3 font-bold text-[#456DFF]">{path.title}</h2>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-[#555]">
                    <th className="px-5 py-3">Course</th>
                    <th className="py-3">Lessons</th>
                    <th className="py-3">XP</th>
                    <th className="py-3">Access</th>
                    <th className="py-3">Levels</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pathCourses.map((course) => {
                    const lessons = LESSONS.filter((l) => course.lessonSlugs.includes(l.slug));
                    return (
                      <tr key={course.id} className="border-b border-white/[0.04]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{course.illustrationEmoji}</span>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-xs text-[#555]">{course.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{lessons.length}</td>
                        <td className="py-3 text-[#F7C325]">{course.xpReward}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              course.premium ? "bg-[#F7C325]/20 text-[#F7C325]" : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {course.premium ? "Premium" : "Free"}
                          </span>
                        </td>
                        <td className="py-3">{course.levels?.length ?? 0}</td>
                        <td className="py-3">
                          <Link
                            href={`/admin/courses/${course.slug}`}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/[0.05]"
                          >
                            Details
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
      })}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold">All Lessons ({LESSONS.length})</h2>
        <Link href="/admin/lessons" className="text-sm text-[#456DFF] hover:underline">
          → Manage lessons in the lessons panel
        </Link>
      </div>
    </div>
  );
}
