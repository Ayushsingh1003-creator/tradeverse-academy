"""Download Piper voice assets into scripts/voice/ (Whisper pulls on first transcribe)."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

VOICE_DIR = Path(__file__).resolve().parent


def main() -> None:
    voice = os.environ.get("PIPER_VOICE", "en_US-kristin-medium")
    print(f"Downloading Piper voice: {voice} -> {VOICE_DIR}")
    subprocess.check_call(
        [sys.executable, "-m", "piper.download_voices", voice, "--download-dir", str(VOICE_DIR)]
    )
    onnx = VOICE_DIR / f"{voice}.onnx"
    if not onnx.is_file():
        raise SystemExit(f"Download failed: expected {onnx}")
    print("Done. Piper voice ready.")


if __name__ == "__main__":
    main()
