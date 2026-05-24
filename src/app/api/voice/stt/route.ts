import { getVoiceServerUrl, VOICE_FETCH_TIMEOUT_MS } from "@/lib/voice/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "Missing audio" }, { status: 400 });
  }

  const upstream = new FormData();
  const name = audio instanceof File ? audio.name : "recording.webm";
  upstream.append("audio", audio, name);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VOICE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${getVoiceServerUrl()}/stt`, {
      method: "POST",
      body: upstream,
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json(
        { fallback: true, error: detail || `STT upstream ${res.status}` },
        { status: 200 },
      );
    }

    const data = (await res.json()) as { text?: string };
    return Response.json({ text: data.text ?? "", source: "whisper" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "STT unavailable";
    return Response.json({ fallback: true, error: message }, { status: 200 });
  } finally {
    clearTimeout(timer);
  }
}
