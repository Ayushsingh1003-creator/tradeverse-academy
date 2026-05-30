"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LibraryVideoLanguageBar } from "@/components/library/LibraryVideoLanguageBar";
import type { LibraryVideo } from "@/lib/data/library";
import {
  hasLibraryVideoHindi,
  resolveLibraryVideoYoutubeId,
  type LibraryVideoLang,
} from "@/lib/libraryVideoLanguage";
import { getYoutubeEmbedUrl } from "@/lib/youtubeEmbed";

export function YouTubePlayerModal({
  open,
  video,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  open: boolean;
  video: LibraryVideo | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}) {
  const [lang, setLang] = useState<LibraryVideoLang>("en");

  useEffect(() => {
    if (!open) return;
    setLang("en");
  }, [open, video?.id]);

  useEffect(() => {
    if (!open) return;
    if (lang === "hi" && video && !hasLibraryVideoHindi(video)) {
      setLang("en");
    }
  }, [open, lang, video]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && hasNext && onNext) onNext();
      if (event.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!open || !video) return null;

  const youtubeId = resolveLibraryVideoYoutubeId(video, lang);
  const embedUrl = getYoutubeEmbedUrl(youtubeId, { autoplay: true });

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Library video player"
    >
      <div
        className="w-full max-w-5xl rounded-2xl border border-border bg-[#121212] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-lg font-semibold text-white">{video.title}</p>
            <p className="text-xs text-text-muted">{video.duration} · {video.publishedAt}</p>
            <LibraryVideoLanguageBar
              lang={lang}
              onLangChange={setLang}
              hindiAvailable={hasLibraryVideoHindi(video)}
            />
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black pb-[56.25%]">
          {embedUrl ? (
            <iframe
              key={`${video.id}-${lang}`}
              className="absolute inset-0 h-full w-full"
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
              Invalid YouTube video id.
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-between gap-2">
          <Button variant="secondary" onClick={onPrev} disabled={!hasPrev}>
            Previous
          </Button>
          <Button variant="secondary" onClick={onNext} disabled={!hasNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
