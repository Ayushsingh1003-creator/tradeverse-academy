"use client";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceInputStatus = {
  ready: boolean;
  whisper: boolean;
  piper: boolean;
};

export async function fetchVoiceStatus(): Promise<VoiceInputStatus> {
  try {
    const res = await fetch("/api/voice/status", { cache: "no-store" });
    const data = (await res.json()) as {
      ready?: boolean;
      whisper?: boolean;
      piper?: boolean;
    };
    return {
      ready: Boolean(data.ready),
      whisper: Boolean(data.whisper),
      piper: Boolean(data.piper),
    };
  } catch {
    return { ready: false, whisper: false, piper: false };
  }
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone not supported in this browser");
    }

    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

    this.recorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream);
    this.chunks = [];

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.start(200);
  }

  stop(): void {
    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch {
        /* ignore */
      }
    }
    this.recorder = null;
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }
  }

  async stopAndGetBlob(): Promise<Blob> {
    const rec = this.recorder;
    if (!rec) throw new Error("Not recording");

    const blob = await new Promise<Blob>((resolve, reject) => {
      rec.onstop = () => {
        const type = rec.mimeType || "audio/webm";
        const b = new Blob(this.chunks, { type });
        this.chunks = [];
        if (!b.size) reject(new Error("No audio captured"));
        else resolve(b);
      };
      rec.onerror = () => reject(new Error("Recording failed"));
      if (rec.state === "recording") rec.stop();
      else reject(new Error("Recorder not active"));
    });

    this.stop();
    return blob;
  }
}

export async function transcribeWithWhisper(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("audio", blob, "recording.webm");

  const res = await fetch("/api/voice/stt", { method: "POST", body: form });
  const data = (await res.json()) as { text?: string; fallback?: boolean; error?: string };

  if (data.fallback || !data.text?.trim()) {
    throw new Error(data.error ?? "Whisper STT unavailable");
  }

  return data.text.trim();
}

/** Browser SpeechRecognition — free fallback when Whisper server is offline. */
export function transcribeWithBrowser(onResult: (text: string) => void, onError: (msg: string) => void): () => void {
  const Ctor = getSpeechRecognition();
  if (!Ctor) {
    onError("Speech recognition not supported");
    return () => {};
  }

  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const text = event.results[0]?.[0]?.transcript?.trim();
    if (text) onResult(text);
    else onError("No speech heard");
  };

  recognition.onerror = () => onError("Could not recognize speech");
  recognition.onend = () => {};

  try {
    recognition.start();
  } catch {
    onError("Could not start microphone");
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  };
}
