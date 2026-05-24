"""
Local voice server: Whisper STT + Piper TTS.
Run: python server.py  (default http://127.0.0.1:8765)
"""
from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

HOST = os.environ.get("VOICE_HOST", "127.0.0.1")
PORT = int(os.environ.get("VOICE_PORT", "8765"))
VOICE_DIR = Path(__file__).resolve().parent
REPO_ROOT = VOICE_DIR.parent.parent


def _load_repo_env() -> None:
    """Apply PIPER_VOICE / WHISPER_MODEL from repo .env.local if not already set."""
    for name in (".env.local", ".env"):
        path = REPO_ROOT / name
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key, value = key.strip(), value.strip().strip('"').strip("'")
            if key in ("PIPER_VOICE", "WHISPER_MODEL", "PIPER_MODEL_PATH") and key not in os.environ:
                os.environ[key] = value
        break


_load_repo_env()
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "base")
# Warm US female — best "friendly teacher" fit in official Piper catalog
PIPER_VOICE = os.environ.get("PIPER_VOICE", "en_US-kristin-medium")


def _resolve_piper_model_path() -> Path:
    """PiperVoice.load() needs a path to the .onnx file, not a voice id string."""
    explicit = os.environ.get("PIPER_MODEL_PATH")
    if explicit:
        return Path(explicit)

    onnx = VOICE_DIR / f"{PIPER_VOICE}.onnx"
    if onnx.is_file():
        return onnx

    cwd_onnx = Path.cwd() / f"{PIPER_VOICE}.onnx"
    if cwd_onnx.is_file():
        return cwd_onnx

    return onnx

app = FastAPI(title="Tradeverse Voice", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_whisper: Optional[object] = None
_piper: Optional[object] = None
_whisper_error: Optional[str] = None
_piper_error: Optional[str] = None


def _load_whisper():
    global _whisper, _whisper_error
    if _whisper is not None or _whisper_error is not None:
        return
    try:
        from faster_whisper import WhisperModel

        _whisper = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    except Exception as exc:  # noqa: BLE001
        _whisper_error = str(exc)


def _load_piper():
    global _piper, _piper_error
    if _piper is not None or _piper_error is not None:
        return
    try:
        from piper import PiperVoice

        model_path = _resolve_piper_model_path()
        if not model_path.is_file():
            _piper_error = (
                f"Piper model not found at {model_path}. "
                f"Run: cd scripts/voice && python download_models.py"
            )
            return
        _piper = PiperVoice.load(model_path)
    except Exception as exc:  # noqa: BLE001
        _piper_error = str(exc)


class TtsRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


@app.get("/health")
def health():
    _load_whisper()
    _load_piper()
    return {
        "ok": _whisper is not None and _piper is not None,
        "whisper": {"ready": _whisper is not None, "model": WHISPER_MODEL, "error": _whisper_error},
        "piper": {
            "ready": _piper is not None,
            "voice": PIPER_VOICE,
            "model_path": str(_resolve_piper_model_path()),
            "error": _piper_error,
        },
    }


@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    _load_whisper()
    if _whisper is None:
        raise HTTPException(status_code=503, detail=_whisper_error or "Whisper not loaded")

    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio")

    suffix = ".webm"
    if audio.filename and "." in audio.filename:
        suffix = "." + audio.filename.rsplit(".", 1)[-1].lower()

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(raw)
        tmp_path = tmp.name

    try:
        segments, _info = _whisper.transcribe(tmp_path, beam_size=5, vad_filter=True)
        text = " ".join(seg.text.strip() for seg in segments).strip()
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    if not text:
        raise HTTPException(status_code=422, detail="No speech detected")

    return {"text": text}


def _piper_syn_config():
    """Slightly brighter, more varied delivery (happy-coach vibe within Piper limits)."""
    from piper.config import SynthesisConfig

    length = float(os.environ.get("PIPER_LENGTH_SCALE", "0.92"))
    noise = float(os.environ.get("PIPER_NOISE_SCALE", "0.78"))
    noise_w = float(os.environ.get("PIPER_NOISE_W", "0.85"))
    return SynthesisConfig(length_scale=length, noise_scale=noise, noise_w_scale=noise_w)


@app.post("/tts")
def text_to_speech(body: TtsRequest):
    import wave

    _load_piper()
    if _piper is None:
        raise HTTPException(status_code=503, detail=_piper_error or "Piper not loaded")

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        _piper.synthesize_wav(body.text.strip(), wav, syn_config=_piper_syn_config())

    return Response(content=buf.getvalue(), media_type="audio/wav")


@app.on_event("startup")
def _warm_models() -> None:
    _load_whisper()
    _load_piper()
    model_path = _resolve_piper_model_path()
    print(f"Whisper: {'ready' if _whisper else 'FAILED'} {_whisper_error or ''}")
    print(f"Piper:   {'ready' if _piper else 'FAILED'} {_piper_error or ''}")
    if _piper:
        print(f"         model={model_path}")


if __name__ == "__main__":
    import uvicorn

    print(f"Voice server http://{HOST}:{PORT}  (Whisper={WHISPER_MODEL}, Piper={PIPER_VOICE})")
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
