const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function getYoutubeEmbedUrl(
  videoId: string,
  opts?: { autoplay?: boolean; rel?: number; modestbranding?: number },
): string | null {
  const normalized = videoId.trim();
  if (!YOUTUBE_ID_RE.test(normalized)) return null;
  const autoplay = opts?.autoplay ? 1 : 0;
  const rel = opts?.rel ?? 0;
  const modest = opts?.modestbranding ?? 1;
  return `https://www.youtube.com/embed/${normalized}?autoplay=${autoplay}&rel=${rel}&modestbranding=${modest}`;
}
