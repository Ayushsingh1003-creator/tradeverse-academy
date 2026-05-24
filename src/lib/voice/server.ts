import { getVoiceServerUrl, VOICE_FETCH_TIMEOUT_MS } from "@/lib/voice/config";

export type VoiceHealth = {
  ok: boolean;
  whisper: { ready: boolean; model?: string; error?: string | null };
  piper: { ready: boolean; voice?: string; error?: string | null };
};

export async function fetchVoiceHealth(): Promise<VoiceHealth | null> {
  const url = getVoiceServerUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${url}/health`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as VoiceHealth;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function transcribeAudioBlob(blob: Blob, filename = "recording.webm"): Promise<string> {
  const url = getVoiceServerUrl();
  const form = new FormData();
  form.append("audio", blob, filename);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VOICE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${url}/stt`, { method: "POST", body: form, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? `STT failed (${res.status})`);
    }
    const data = (await res.json()) as { text?: string };
    if (!data.text?.trim()) throw new Error("No speech detected");
    return data.text.trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const url = getVoiceServerUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VOICE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${url}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? `TTS failed (${res.status})`);
    }
    return await res.arrayBuffer();
  } finally {
    clearTimeout(timer);
  }
}
