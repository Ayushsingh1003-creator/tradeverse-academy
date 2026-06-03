"use client";

import { useState } from "react";
import type { LibraryVideo } from "@/lib/db/schema";
import { youtubeWatchUrl } from "@/lib/youtubeEmbed";
import { updateLibraryVideo } from "../../actions";
import { LibraryVideoFormFields } from "./LibraryVideoFormFields";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export function LibraryVideoEditRow({ video, courseId }: { video: LibraryVideo; courseId: string }) {
  const [open, setOpen] = useState(false);
  const isLearn = video.type === "learn";

  return (
    <tr className="border-b border-white/[0.04]">
      <td colSpan={7} className="px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-[#456DFF] hover:underline"
        >
          {open ? "Hide edit" : "Edit item"}
        </button>
        {open ? (
          <form
            action={updateLibraryVideo.bind(null, video.id, courseId)}
            className="mt-3 grid gap-2 rounded-xl border border-white/[0.08] bg-[#141414] p-4 md:grid-cols-2"
          >
            <LibraryVideoFormFields
              variant="edit"
              defaultType={isLearn ? "learn" : "video"}
              defaultLearnSlug={video.learnSlug}
              defaultTitle={video.title}
              defaultYoutubeEn={video.youtubeVideoId ? youtubeWatchUrl(video.youtubeVideoId) : ""}
              defaultYoutubeHi={video.youtubeVideoIdHi ? youtubeWatchUrl(video.youtubeVideoIdHi) : ""}
              defaultDescription={video.description}
              defaultThumbnailUrl={video.thumbnailUrl}
              defaultDuration={video.duration}
              defaultPublishedAt={video.publishedAt}
              defaultTags={tagsDisplay(video.tags)}
            />
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
