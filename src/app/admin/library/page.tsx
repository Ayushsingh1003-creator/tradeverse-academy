import Link from "next/link";
import { db } from "@/lib/db";
import type { LibraryCourse } from "@/lib/db/schema";

export default async function AdminLibraryPage() {
  const courses = (await db.libraryCourse.findMany({
    orderBy: { order: "asc" },
  })) as LibraryCourse[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Library</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/library/standalone"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/[0.05]"
          >
            Independent videos
          </Link>
          <Link
            href="/admin/library/new"
            className="rounded-xl bg-[#456DFF] px-4 py-2.5 text-sm font-semibold text-white"
          >
            + Add Course
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-8 text-center text-[#666]">
            No library courses yet.{" "}
            <Link href="/admin/library/new" className="text-[#456DFF] hover:underline">
              Add one
            </Link>
          </p>
        ) : null}
        {courses.map((course) => (
          <div key={course.id} className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-4">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnailUrl} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
            ) : null}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{course.title}</h3>
                <p className="mt-1 text-xs text-[#666]">
                  {course.level}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  course.published ? "bg-green-500/20 text-green-400" : "bg-[#333] text-[#666]"
                }`}
              >
                {course.published ? "Live" : "Draft"}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/admin/library/${course.id}`}
                className="flex-1 rounded-xl border border-white/10 py-2 text-center text-xs font-semibold hover:bg-white/[0.05]"
              >
                Edit
              </Link>
              <Link
                href={`/admin/library/${course.id}/videos`}
                className="flex-1 rounded-xl border border-white/10 py-2 text-center text-xs font-semibold hover:bg-white/[0.05]"
              >
                Videos
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
