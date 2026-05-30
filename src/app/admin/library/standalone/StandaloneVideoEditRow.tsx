"use client";

import { useState } from "react";
import type { LibraryStandaloneVideo } from "@/lib/db/schema";
import { youtubeWatchUrl } from "@/lib/youtubeEmbed";
import { updateStandaloneVideo } from "../actions";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export function StandaloneVideoEditRow({ video }: { video: LibraryStandaloneVideo }) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="border-b border-white/[0.04]">
      <td colSpan={7} className="px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-[#456DFF] hover:underline"
        >
          {open ? "Hide edit" : "Edit video"}
        </button>
        {open ? (
          <form
            action={updateStandaloneVideo.bind(null, video.id)}
            className="mt-3 grid gap-2 rounded-xl border border-white/[0.08] bg-[#141414] p-4 md:grid-cols-2"
          >
            <input
              name="youtubeUrlEn"
              defaultValue={youtubeWatchUrl(video.youtubeVideoId)}
              placeholder="English YouTube URL"
              required
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="youtubeUrlHi"
              defaultValue={video.youtubeVideoIdHi ? youtubeWatchUrl(video.youtubeVideoIdHi) : ""}
              placeholder="Hindi YouTube URL (optional)"
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="title"
              defaultValue={video.title}
              placeholder="Title"
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="description"
              defaultValue={video.description}
              placeholder="Description"
              className="md:col-span-2 rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="thumbnailUrl"
              defaultValue={video.thumbnailUrl}
              placeholder="Thumbnail URL"
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="duration"
              defaultValue={video.duration}
              placeholder="Duration"
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="publishedAt"
              defaultValue={video.publishedAt}
              placeholder="Published YYYY-MM-DD"
              className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <input
              name="tags"
              defaultValue={tagsDisplay(video.tags)}
              placeholder="Tags, comma-separated"
              className="md:col-span-2 rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-[#aaa]">
              <input type="hidden" name="published" value="false" />
              <input
                type="checkbox"
                name="published"
                value="true"
                defaultChecked={video.published}
                className="rounded border-white/20"
              />
              Published (visible on library page)
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-xl bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white">
                Save changes
              </button>
            </div>
          </form>
        ) : null}
      </td>
    </tr>
  );
}
