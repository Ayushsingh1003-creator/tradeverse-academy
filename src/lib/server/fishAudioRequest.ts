/**
 * Shared Fish Audio TTS request builder — used by the live streaming proxy
 * (src/app/api/voice/tts/route.ts) and the offline voice-response generation
 * script (scripts/voice-responses/generate.ts) so both stay on the same
 * model/voice/latency config and can't drift apart.
 */
const DEFAULT_MODEL = "s2.1-pro-free";
// Docs example reference voice (https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech) —
// used when FISH_AUDIO_REFERENCE_ID isn't set.
const DEFAULT_REFERENCE_ID = "933563129e564b19a115bedd57b7406a";

export type FishAudioRequest = { url: string; init: RequestInit };

/** Returns null if FISH_AUDIO_API_KEY isn't configured. */
export function buildFishAudioTtsRequest(text: string, signal?: AbortSignal): FishAudioRequest | null {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) return null;

  const referenceId = process.env.FISH_AUDIO_REFERENCE_ID?.trim() || DEFAULT_REFERENCE_ID;
  const model = process.env.FISH_AUDIO_MODEL?.trim() || DEFAULT_MODEL;
  // "balanced" trims latency vs. the "normal" default while keeping speech quality acceptable for a coaching voice.
  const latency = process.env.FISH_AUDIO_LATENCY?.trim() || "balanced";

  return {
    url: "https://api.fish.audio/v1/tts",
    init: {
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
        latency,
      }),
      signal,
    },
  };
}
