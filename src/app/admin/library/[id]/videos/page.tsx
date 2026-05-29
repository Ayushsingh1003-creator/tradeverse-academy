import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { LibraryVideo } from "@/lib/db/schema";
import { addLibraryVideo, deleteLibraryVideo, moveLibraryVideo } from "../../actions";
import { LibraryVideoEditRow } from "./LibraryVideoEditRow";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export default async function AdminLibraryVideosPage({ params }: { params: { id: string } }) {
  const course = await db.libraryCourse.findUnique({
    where: { id: params.id },
    include: { videos: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/library" className="text-sm text-[#666] hover:text-white">
            ← Library
          </Link>
          <h1 className="mt-2 text-2xl font-black">Videos · {course.title}</h1>
        </div>
        <Link
          href={`/admin/library/${course.id}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/[0.05]"
        >
          Edit course
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <h2 className="mb-4 font-bold">Add video</h2>
        <form action={addLibraryVideo.bind(null, course.id)} className="grid gap-3 md:grid-cols-2">
          <input
            name="youtubeVideoId"
            placeholder="YouTube video ID"
            required
            className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
          />
          <input name="title" placeholder="Title" className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm" />
          <input
            name="description"
            placeholder="Description"
            className="md:col-span-2 rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
          />
          <input name="thumbnailUrl" placeholder="Thumbnail URL (optional)" className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm" />
          <input name="duration" placeholder="Duration e.g. 14:20" className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm" />
          <input name="publishedAt" placeholder="Published date YYYY-MM-DD" className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm" />
          <input name="tags" placeholder="Tags, comma-separated" className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm" />
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white">
              Add video
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-[#555]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="py-3">Title</th>
              <th className="py-3">YouTube</th>
              <th className="py-3">Duration</th>
              <th className="py-3">Tags</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(course.videos as LibraryVideo[]).map((v, idx) => (
              <Fragment key={v.id}>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-[#666]">{idx + 1}</td>
                  <td className="py-3 font-medium">{v.title}</td>
                  <td className="py-3 text-[#888]">{v.youtubeVideoId}</td>
                  <td className="py-3">{v.duration}</td>
                  <td className="py-3 text-xs text-[#666]">{tagsDisplay(v.tags)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <form action={moveLibraryVideo.bind(null, v.id, course.id, -1)}>
                        <button type="submit" className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5">
                          ↑
                        </button>
                      </form>
                      <form action={moveLibraryVideo.bind(null, v.id, course.id, 1)}>
                        <button type="submit" className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5">
                          ↓
                        </button>
                      </form>
                      <form action={deleteLibraryVideo.bind(null, v.id, course.id)}>
                        <button type="submit" className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
                <LibraryVideoEditRow video={v} courseId={course.id} />
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
