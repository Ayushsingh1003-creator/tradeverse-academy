import { textForSpeech } from "@/lib/speechText";
import { SentenceBuffer } from "@/lib/sentenceBuffer";
import { TtsAudioSession } from "@/lib/ttsAudioQueue";
import { CoachTiming } from "@/lib/coachTiming";

let activeSession: TtsAudioSession | null = null;
let activeStaticAudio: HTMLAudioElement | null = null;
/** Bumped on every new speak/stop — stale async work must never touch a later reply's UI or audio. */
let generation = 0;

export function isVoiceCoachSupported() {
  return typeof window !== "undefined" && ("speechSynthesis" in window || typeof Audio !== "undefined");
}

/** Cancels the in-flight streaming TTS session (if any), any browser-TTS fallback speech, and any static playback. */
export function stopVoiceCoach() {
  generation += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  activeSession?.cancel();
  activeSession = null;
  if (activeStaticAudio) {
    activeStaticAudio.pause();
    activeStaticAudio.onended = null;
    activeStaticAudio.onerror = null;
    activeStaticAudio.src = "";
    activeStaticAudio = null;
  }
}

function speakWithBrowserTts(text: string, myGeneration: number, onEnd?: () => void) {
  if (myGeneration !== generation) return;
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
    if (myGeneration === generation) onEnd?.();
  };
  utterance.onerror = () => {
    if (myGeneration === generation) onEnd?.();
  };
  window.speechSynthesis.speak(utterance);
}

export type CoachStreamSession = {
  /** Feed the next streamed text delta from the LLM as soon as it arrives. */
  feedText: (delta: string) => void;
  /** Call once the LLM stream has finished — flushes any trailing partial sentence. */
  finish: () => void;
};

/**
 * Starts a new low-latency streaming TTS session: text fed in via feedText()
 * is split into sentences as soon as a natural boundary appears, and each
 * sentence is sent to Fish Audio and queued for playback immediately —
 * without waiting for the LLM (or earlier sentences' audio) to finish.
 *
 * Cancels any previous session first, so audio from an old reply can never
 * play after a new request starts.
 */
export function startStreamingCoachSession(onEnd?: () => void, timing?: CoachTiming): CoachStreamSession {
  stopVoiceCoach();
  const myGeneration = generation;

  const session = new TtsAudioSession(timing);
  activeSession = session;
  const buffer = new SentenceBuffer();
  let fullText = "";
  let firstSentenceMarked = false;

  session.onAllDone = (anyPlayed) => {
    if (myGeneration !== generation) return;
    if (!anyPlayed && fullText.trim()) {
      // Fish Audio never actually produced audible playback for this reply — fall back to browser TTS once.
      speakWithBrowserTts(fullText, myGeneration, onEnd);
      return;
    }
    onEnd?.();
  };

  const enqueue = (sentence: string) => {
    const spoken = textForSpeech(sentence);
    if (!spoken) return;
    if (!firstSentenceMarked) {
      firstSentenceMarked = true;
      timing?.mark("firstSentenceDetected");
    }
    session.enqueueText(spoken);
  };

  return {
    feedText(delta: string) {
      if (myGeneration !== generation) return;
      fullText += delta;
      for (const sentence of buffer.push(delta)) enqueue(sentence);
    },
    finish() {
      if (myGeneration !== generation) return;
      const rest = buffer.flush();
      if (rest) enqueue(rest);
      session.close();
    },
  };
}

export type StaticCoachAudioUrls = { prefixUrl: string | null; responseUrl?: string };

/**
 * Plays a pre-generated static clip sequence for a lesson-question outcome:
 * the shared prefix clip, then (if present) the per-question response clip.
 * Static `<audio src="https://...">` streams progressively via HTTP range
 * requests on its own, so no chunking/MSE machinery is needed here — that's
 * specific to the live Fish Audio proxy used by startStreamingCoachSession.
 *
 * Shares the same generation/cancellation mechanism as the streaming coach
 * session, so the two can never overlap or race.
 */
export function playStaticCoachAudio(urls: StaticCoachAudioUrls, onEnd?: () => void) {
  stopVoiceCoach();
  const myGeneration = generation;

  const playClip = (url: string, next?: () => void) => {
    if (myGeneration !== generation) return;
    const audio = new Audio(url);
    activeStaticAudio = audio;
    const advance = () => {
      if (myGeneration !== generation) return;
      if (activeStaticAudio === audio) activeStaticAudio = null;
      if (next) next();
      else onEnd?.();
    };
    audio.onended = advance;
    audio.onerror = advance;
    void audio.play().catch(advance);
  };

  const responseUrl = urls.responseUrl;
  if (urls.prefixUrl) {
    playClip(urls.prefixUrl, responseUrl ? () => playClip(responseUrl) : undefined);
  } else if (responseUrl) {
    playClip(responseUrl);
  } else {
    onEnd?.();
  }
}
