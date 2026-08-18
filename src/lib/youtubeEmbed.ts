const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Extract YouTube video id from a URL or bare id. Returns null if invalid. */
export function parseYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && YOUTUBE_ID_RE.test(v)) return v;
      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch?.[1]) return embedMatch[1];
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(
  videoIdOrUrl: string,
  opts?: { autoplay?: boolean; rel?: number; modestbranding?: number; controls?: number },
): string | null {
  const normalized = parseYoutubeVideoId(videoIdOrUrl);
  if (!normalized) return null;
  const params = new URLSearchParams({
    autoplay: opts?.autoplay ? "1" : "0",
    rel: String(opts?.rel ?? 0),
    modestbranding: String(opts?.modestbranding ?? 1),
    controls: String(opts?.controls ?? 1),
    iv_load_policy: "3",
    playsinline: "1",
    fs: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${normalized}?${params.toString()}`;
}

/** Library player: hides control bar (and the "Watch on YouTube" badge). Tap video to play/pause. */
export function getLibraryYoutubeEmbedUrl(
  videoIdOrUrl: string,
  opts?: { autoplay?: boolean },
): string | null {
  return getYoutubeEmbedUrl(videoIdOrUrl, {
    autoplay: opts?.autoplay,
    rel: 0,
    modestbranding: 1,
    controls: 0,
  });
}

export function youtubeThumbnailUrl(videoIdOrUrl: string): string {
  const id = parseYoutubeVideoId(videoIdOrUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
