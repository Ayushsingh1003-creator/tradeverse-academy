export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FISH_AUDIO_FETCH_TIMEOUT_MS = 15_000;
const DEFAULT_MODEL = "s2.1-pro-free";
// Docs example reference voice (https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech) —
// used when FISH_AUDIO_REFERENCE_ID isn't set.
const DEFAULT_REFERENCE_ID = "933563129e564b19a115bedd57b7406a";

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

  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return Response.json({ fallback: true, error: "FISH_AUDIO_API_KEY not configured" }, { status: 200 });
  }

  const referenceId = process.env.FISH_AUDIO_REFERENCE_ID?.trim() || DEFAULT_REFERENCE_ID;
  const model = process.env.FISH_AUDIO_MODEL?.trim() || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FISH_AUDIO_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model,
      },
      body: JSON.stringify({
        text: text.slice(0, 2000),
        reference_id: referenceId,
        format: "mp3",
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json(
        { fallback: true, error: `Fish Audio ${res.status}: ${detail.slice(0, 300)}` },
        { status: 200 },
      );
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
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
  }
}
