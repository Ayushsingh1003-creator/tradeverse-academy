"use client";
import type { LibraryVideo } from "@/lib/data/library";
import { Card } from "@/components/ui/Card";

export function LibraryVideoCard({
  video,
  onWatch,
}: {
  video: LibraryVideo;
  onWatch: (video: LibraryVideo) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onWatch(video)}
      className="block h-full w-full cursor-pointer rounded-2xl border border-transparent p-0 text-left transition hover:border-[var(--tv-acc-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tv-acc)]"
    >
      <Card className="flex h-full flex-col overflow-hidden p-0">
        <div className="relative aspect-video w-full">
          <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="line-clamp-2 text-sm font-semibold text-[color:var(--tv-ink)]">{video.title}</p>
          <p className="mt-1 text-xs text-[color:var(--tv-mute)]">
            {video.duration} · {video.publishedAt}
          </p>
          <p className="mt-2 line-clamp-2 text-xs text-[color:var(--tv-mute)]">{video.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--tv-line)] px-2 py-0.5 text-[10px] text-[color:var(--tv-mute)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-[#88C9F7]">Click to watch</p>
        </div>
      </Card>
    </button>
  );
}
