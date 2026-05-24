import { fetchVoiceHealth } from "@/lib/voice/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await fetchVoiceHealth();
  if (!health) {
    return Response.json({
      ready: false,
      whisper: false,
      piper: false,
      message: "Voice server offline. Run: npm run voice:server",
    });
  }

  return Response.json({
    ready: health.ok,
    whisper: health.whisper.ready,
    piper: health.piper.ready,
    whisperModel: health.whisper.model,
    piperVoice: health.piper.voice,
    errors: {
      whisper: health.whisper.error,
      piper: health.piper.error,
    },
  });
}
