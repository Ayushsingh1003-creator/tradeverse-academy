import { textForSpeech } from "@/lib/speechText";

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
/** Bumped when a new speak starts or stopVoiceCoach runs — stale async must not fall back to browser TTS. */
let speakGeneration = 0;

const ttsCache = new Map<string, Promise<Blob | null>>();

export function isVoiceCoachSupported() {
  return typeof window !== "undefined" && ("speechSynthesis" in window || typeof Audio !== "undefined");
}

function clearPiperAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.src = "";
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export function stopVoiceCoach() {
  speakGeneration += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  clearPiperAudio();
}

/** Wait until Piper audio is cached (or failed). Call before showing coach text when voice is on. */
export async function prepareCoachTts(text: string): Promise<boolean> {
  const trimmed = textForSpeech(text);
  if (!trimmed || typeof window === "undefined") return false;
  prefetchCoachTts(trimmed);
  const pending = ttsCache.get(trimmed);
  if (!pending) return false;
  const blob = await pending;
  return blob !== null;
}

/** Start Piper TTS fetch as soon as coach text is known (before playback). */
export function prefetchCoachTts(text: string): void {
  const trimmed = textForSpeech(text);
  if (!trimmed || typeof window === "undefined") return;
  if (ttsCache.has(trimmed)) return;

  ttsCache.set(
    trimmed,
    fetch("/api/voice/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !contentType.includes("audio")) return null;
        const blob = await res.blob();
        return blob.size > 0 ? blob : null;
      })
      .catch(() => null),
  );

  if (ttsCache.size > 12) {
    const first = ttsCache.keys().next().value;
    if (first) ttsCache.delete(first);
  }
}

async function fetchPiperBlob(text: string, generation: number): Promise<Blob | null> {
  const trimmed = textForSpeech(text);
  if (!trimmed || generation !== speakGeneration) return null;

  let pending = ttsCache.get(trimmed);
  if (!pending) {
    prefetchCoachTts(trimmed);
    pending = ttsCache.get(trimmed);
  }

  const blob = pending ? await pending : null;
  if (generation !== speakGeneration) return null;
  return blob;
}

function speakWithBrowserTts(text: string, generation: number, onEnd?: () => void) {
  if (generation !== speakGeneration) {
    onEnd?.();
    return;
  }
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  const spoken = textForSpeech(text);
  if (!spoken) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = () => {
    if (generation === speakGeneration) onEnd?.();
  };
  utterance.onerror = () => {
    if (generation === speakGeneration) onEnd?.();
  };
  window.speechSynthesis.speak(utterance);
}

async function speakWithPiper(text: string, generation: number): Promise<boolean> {
  if (typeof window === "undefined" || generation !== speakGeneration) return false;

  const blob = await fetchPiperBlob(text, generation);
  if (!blob || generation !== speakGeneration) return false;

  clearPiperAudio();
  currentObjectUrl = URL.createObjectURL(blob);
  currentAudio = new Audio(currentObjectUrl);
  currentAudio.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    if (!currentAudio || generation !== speakGeneration) {
      reject(new Error("Cancelled"));
      return;
    }
    const audio = currentAudio;
    const done = () => resolve();
    audio.onended = done;
    audio.onerror = () => reject(new Error("Playback failed"));
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void audio.play().catch(reject);
    } else {
      audio.oncanplaythrough = () => {
        audio.oncanplaythrough = null;
        void audio.play().catch(reject);
      };
      audio.load();
    }
  });

  return generation === speakGeneration;
}

/** Speak coach reply — Piper WAV when server is up, else browser speechSynthesis. */
export async function speakCoachText(text: string, enabled: boolean, onEnd?: () => void) {
  if (!enabled || !textForSpeech(text)) {
    onEnd?.();
    return;
  }

  stopVoiceCoach();
  const generation = speakGeneration;

  try {
    const usedPiper = await speakWithPiper(text, generation);
    if (generation !== speakGeneration) return;
    if (usedPiper) {
      onEnd?.();
      clearPiperAudio();
      return;
    }
  } catch {
    clearPiperAudio();
    if (generation !== speakGeneration) return;
  }

  if (generation !== speakGeneration) return;

  speakWithBrowserTts(text, generation, onEnd);
}
