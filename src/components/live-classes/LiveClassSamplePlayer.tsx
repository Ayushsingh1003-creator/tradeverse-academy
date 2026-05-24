"use client";

function getSafeEmbedUrl(youtubeVideoId: string) {
  const id = youtubeVideoId.trim();
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

export function LiveClassSamplePlayer({
  youtubeVideoId,
  title,
}: {
  youtubeVideoId: string;
  title: string;
}) {
  const embedUrl = getSafeEmbedUrl(youtubeVideoId);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#111]">
      <div className="aspect-video w-full">
        {embedUrl ? (
          <iframe
            title={`${title} sample class`}
            src={embedUrl}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Invalid sample video id.
          </div>
        )}
      </div>
    </div>
  );
}
