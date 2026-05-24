/** Base URL for the local Piper + Whisper sidecar (scripts/voice/server.py). */
export function getVoiceServerUrl(): string {
  return process.env.VOICE_SERVER_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8765";
}

export const VOICE_FETCH_TIMEOUT_MS = 45_000;
