import { buildFishAudioTtsRequest } from "@/lib/server/fishAudioRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FISH_AUDIO_FETCH_TIMEOUT_MS = 15_000;

export async function POST(req: Request) {
  let text = "";
  try {
    const body = (await req.json()) as { text?: string };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return Response.json({ fallback: true, error: "Invalid body" }, { status: 200 });
  }

  if (!text) {
    return Response.json({ fallback: true, error: "Empty text" }, { status: 200 });
  }

  const controller = new AbortController();
  const onClientAbort = () => controller.abort();
  req.signal?.addEventListener("abort", onClientAbort);
  const timer = setTimeout(() => controller.abort(), FISH_AUDIO_FETCH_TIMEOUT_MS);

  try {
    const request = buildFishAudioTtsRequest(text, controller.signal);
    if (!request) {
      return Response.json({ fallback: true, error: "FISH_AUDIO_API_KEY not configured" }, { status: 200 });
    }

    const res = await fetch(request.url, request.init);

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      return Response.json(
        { fallback: true, error: `Fish Audio ${res.status}: ${detail.slice(0, 300)}` },
        { status: 200 },
      );
    }

    // Pipe Fish Audio's chunked response straight through as it arrives — do not
    // buffer the whole clip before responding, so the browser can start playing
    // as soon as the first bytes land.
    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS unavailable";
    return Response.json({ fallback: true, error: message }, { status: 200 });
  } finally {
    clearTimeout(timer);
    req.signal?.removeEventListener("abort", onClientAbort);
  }
}
