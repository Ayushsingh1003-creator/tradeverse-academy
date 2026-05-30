import Link from "next/link";
import { Fragment } from "react";
import { db } from "@/lib/db";
import type { LibraryStandaloneVideo } from "@/lib/db/schema";
import { addStandaloneVideo, deleteStandaloneVideo, moveStandaloneVideo } from "../actions";
import { StandaloneVideoEditRow } from "./StandaloneVideoEditRow";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export default async function AdminStandaloneVideosPage() {
  const videos = (await db.libraryStandaloneVideo.findMany({
    orderBy: { order: "asc" },
  })) as LibraryStandaloneVideo[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/library" className="text-sm text-[#666] hover:text-white">
            ← Library
          </Link>
          <h1 className="mt-2 text-2xl font-black">Independent videos</h1>
          <p className="mt-1 text-sm text-[#666]">
            Standalone YouTube lessons shown in the Library &quot;Independent Videos&quot; section.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <h2 className="mb-4 font-bold">Add video</h2>
        <form action={addStandaloneVideo} className="grid gap-3 md:grid-cols-2">
          <input
            name="youtubeUrlEn"
            placeholder="English YouTube URL"
            required
            className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
          />
          <input
            name="youtubeUrlHi"
            placeholder="Hindi YouTube URL (optional)"
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
          <label className="flex items-center gap-2 text-sm text-[#aaa] md:col-span-2">
            <input type="hidden" name="published" value="false" />
            <input type="checkbox" name="published" value="true" defaultChecked className="rounded border-white/20" />
            Published (visible on library page)
          </label>
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
              <th className="py-3">Status</th>
              <th className="py-3">Duration</th>
              <th className="py-3">Tags</th>
              <th className="py-3">Hindi</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#666]">
                  No independent videos yet. Add one above or they will fall back to static defaults until configured.
                </td>
              </tr>
            ) : null}
            {videos.map((v, idx) => (
              <Fragment key={v.id}>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-[#666]">{idx + 1}</td>
                  <td className="py-3 font-medium">{v.title}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.published ? "bg-green-500/20 text-green-400" : "bg-[#333] text-[#666]"
                      }`}
                    >
                      {v.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3">{v.duration}</td>
                  <td className="py-3 text-xs text-[#666]">{tagsDisplay(v.tags)}</td>
                  <td className="py-3 text-xs text-[#666]">{v.youtubeVideoIdHi ? "Yes" : "—"}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <form action={moveStandaloneVideo.bind(null, v.id, -1)}>
                        <button type="submit" className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5">
                          ↑
                        </button>
                      </form>
                      <form action={moveStandaloneVideo.bind(null, v.id, 1)}>
                        <button type="submit" className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5">
                          ↓
                        </button>
                      </form>
                      <form action={deleteStandaloneVideo.bind(null, v.id)}>
                        <button type="submit" className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
                <StandaloneVideoEditRow video={v} />
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
