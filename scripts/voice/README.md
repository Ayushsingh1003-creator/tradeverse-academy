# Voice server (Whisper STT + Piper TTS)

Local sidecar for the lesson AI coach. Next.js proxies `/api/voice/*` to this server.

## Setup (one time)

```bash
cd scripts/voice
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python download_models.py
```

Requires **ffmpeg** on PATH for Whisper to decode WebM recordings ([ffmpeg.org](https://ffmpeg.org)).

## Run

From repo root:

```bash
npm run voice:server
```

Or manually:

```bash
cd scripts/voice && .venv/Scripts/python server.py
```

Default URL: `http://127.0.0.1:8765`

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VOICE_SERVER_URL` | `http://127.0.0.1:8765` | Set in Next.js `.env.local` |
| `WHISPER_MODEL` | `base` | `tiny`, `base`, `small`, … |
| `PIPER_VOICE` | `en_US-kristin-medium` | Piper voice id (default: warm US teacher) |
| `PIPER_LENGTH_SCALE` | `0.92` | Lower = slightly faster/brighter (try `0.88`–`1.0`) |
| `PIPER_NOISE_SCALE` | `0.78` | Slightly more prosody variation |
| `VOICE_HOST` / `VOICE_PORT` | `127.0.0.1` / `8765` | Python server bind |

## Endpoints

- `GET /health` — model readiness
- `POST /stt` — multipart `audio` → `{ "text": "..." }`
- `POST /tts` — JSON `{ "text": "..." }` → `audio/wav`

## Voice selection

**Default: `en_US-kristin-medium`** — warm US female, closest to a friendly classroom teacher in Piper.

**Also try (preview before switching):**
| Voice | Vibe |
|-------|------|
| `en_US-amy-medium` | Friendly, approachable female |
| `en_US-kristin-medium` | Warm teacher (default) |
| `en_US-lessac-medium` | Upbeat male narrator |
| `en_GB-cori-medium` | Expressive British female |
| `en_US-ryan-medium` | Calm neutral male (previous default) |

Piper is **not** as expressive as ElevenLabs-style voices — it will still sound synthetic, but Kristin + slightly faster synthesis settings feel more engaging.

Piper’s official catalog has **no Indian English (`en_IN`) male** voice.

Preview voices: https://rhasspy.github.io/piper-samples/demo.html

To switch: set `PIPER_VOICE`, run `python download_models.py`, restart `npm run voice:server`.

## Production

Run the Python server on the same host or a private network; point `VOICE_SERVER_URL` at it. Vercel serverless cannot run Whisper/Piper locally — use a VPS or container.
