import type { LibraryVideo } from "@/lib/data/library";

export type LibraryVideoLang = "en" | "hi";

export function hasLibraryVideoHindi(video: LibraryVideo): boolean {
  return Boolean(video.youtubeVideoIdHi?.trim());
}

export function resolveLibraryVideoYoutubeId(video: LibraryVideo, lang: LibraryVideoLang): string {
  if (lang === "hi" && video.youtubeVideoIdHi?.trim()) {
    return video.youtubeVideoIdHi.trim();
  }
  return video.youtubeVideoId;
}
