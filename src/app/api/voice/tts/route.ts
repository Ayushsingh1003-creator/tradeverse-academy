import { getVoiceServerUrl, VOICE_FETCH_TIMEOUT_MS } from "@/lib/voice/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const timer = setTimeout(() => controller.abort(), VOICE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${getVoiceServerUrl()}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 2000) }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return Response.json({ fallback: true, error: `TTS upstream ${res.status}` }, { status: 200 });
    }

    const wav = await res.arrayBuffer();
    return new Response(wav, {
      headers: {
        "Content-Type": "audio/wav",
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
