import { fetchVoiceHealth } from "@/lib/voice/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await fetchVoiceHealth();
  const fishAudioReady = Boolean(process.env.FISH_AUDIO_API_KEY);
  const whisperReady = Boolean(health?.whisper.ready);

  return Response.json({
    ready: whisperReady || fishAudioReady,
    whisper: whisperReady,
    fishAudio: fishAudioReady,
    whisperModel: health?.whisper.model,
    message: whisperReady ? undefined : "Whisper STT offline. Run: npm run voice:server",
    errors: {
      whisper: health?.whisper.error,
    },
  });
}
