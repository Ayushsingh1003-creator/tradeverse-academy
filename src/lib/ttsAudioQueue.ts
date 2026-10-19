import type { CoachTiming } from "@/lib/coachTiming";

/** How many Fish Audio TTS requests may be in flight at once. Order of playback is always preserved regardless. */
export const MAX_TTS_CONCURRENCY = 1;
const MAX_CACHE_ENTRIES = 20;

/** Raw audio bytes for repeated static text (e.g. a hint spoken twice), keyed by cleaned text. */
const audioCache = new Map<string, Uint8Array>();

function cacheGet(text: string): Uint8Array | undefined {
  return audioCache.get(text);
}

function cacheSet(text: string, bytes: Uint8Array) {
  if (audioCache.has(text)) return;
  audioCache.set(text, bytes);
  if (audioCache.size > MAX_CACHE_ENTRIES) {
    const first = audioCache.keys().next().value;
    if (first) audioCache.delete(first);
  }
}

function supportsMseMp3(): boolean {
  if (typeof window === "undefined" || typeof MediaSource === "undefined") return false;
  try {
    return MediaSource.isTypeSupported("audio/mpeg");
  } catch {
    return false;
  }
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

type ItemStatus = "pending" | "fetching" | "ready" | "playing" | "done" | "error";

type QueueItem = {
  index: number;
  text: string;
  status: ItemStatus;
  audio: HTMLAudioElement | null;
  objectUrl: string | null;
  cacheChunks: Uint8Array[];
  controller: AbortController;
};

/**
 * Plays Fish Audio TTS for a stream of enqueued sentences, strictly in order,
 * starting playback as soon as the first sentence's audio is available —
 * without waiting for later sentences to finish generating or fetching.
 */
export class TtsAudioSession {
  private items: QueueItem[] = [];
  private nextIndex = 0;
  private nextPlayIndex = 0;
  private activeFetches = 0;
  private currentlyPlaying = false;
  private cancelled = false;
  private closed = false;
  private anyPlayed = false;
  private timing?: CoachTiming;

  /** Fires once every enqueued sentence has finished (played or errored out). */
  onAllDone?: (anyPlayed: boolean) => void;

  constructor(timing?: CoachTiming) {
    this.timing = timing;
  }

  enqueueText(text: string) {
    if (this.cancelled) return;
    this.items.push({
      index: this.nextIndex++,
      text,
      status: "pending",
      audio: null,
      objectUrl: null,
      cacheChunks: [],
      controller: new AbortController(),
    });
    this.pump();
  }

  /** No more sentences will be enqueued — fire onAllDone once everything queued has played. */
  close() {
    this.closed = true;
    this.checkAllDone();
  }

  cancel() {
    this.cancelled = true;
    for (const item of this.items) {
      item.controller.abort();
      this.disposeItem(item);
    }
    this.items = [];
  }

  private pump() {
    if (this.cancelled) return;
    while (this.activeFetches < MAX_TTS_CONCURRENCY) {
      const next = this.items.find((it) => it.status === "pending");
      if (!next) break;
      this.activeFetches++;
      next.status = "fetching";
      void this.fetchItem(next).finally(() => {
        this.activeFetches--;
        this.pump();
      });
    }
  }

  private async fetchItem(item: QueueItem) {
    const cached = cacheGet(item.text);
    if (cached) {
      this.buildBlobAudio(item, cached);
      return;
    }

    if (item.index === 0) this.timing?.mark("fishStart");

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.text }),
        signal: item.controller.signal,
      });
      if (this.cancelled) return;

      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || !contentType.includes("audio") || !res.body) {
        item.status = "error";
        this.tryPlayNext();
        return;
      }

      if (supportsMseMp3()) {
        try {
          await this.playWithMse(item, res.body);
          return;
        } catch {
          // Fall through to blob mode below only if nothing was buffered/played yet.
          if (item.status === "playing" || item.status === "done") return;
        }
      }

      await this.playWithBlob(item, res.body);
    } catch {
      if (!this.cancelled) {
        item.status = "error";
        this.tryPlayNext();
      }
    }
  }

  private async playWithBlob(item: QueueItem, body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let firstByte = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (this.cancelled) return;
      if (done) break;
      if (value?.byteLength) {
        if (!firstByte && item.index === 0) {
          firstByte = true;
          this.timing?.mark("fishFirstByte");
        }
        chunks.push(value);
      }
    }
    if (this.cancelled) return;

    const bytes = concatChunks(chunks);
    if (bytes.byteLength === 0) {
      item.status = "error";
      this.tryPlayNext();
      return;
    }
    cacheSet(item.text, bytes);
    this.buildBlobAudio(item, bytes);
  }

  private buildBlobAudio(item: QueueItem, bytes: Uint8Array) {
    const blob = new Blob([bytes as BlobPart], { type: "audio/mpeg" });
    item.objectUrl = URL.createObjectURL(blob);
    item.audio = new Audio(item.objectUrl);
    item.audio.preload = "auto";
    item.status = "ready";
    if (item.index === 0) this.timing?.mark("firstAudioReady");
    this.tryPlayNext();
  }

  private async playWithMse(item: QueueItem, body: ReadableStream<Uint8Array>) {
    const mediaSource = new MediaSource();
    const audio = new Audio();
    item.audio = audio;
    item.objectUrl = URL.createObjectURL(mediaSource);
    audio.src = item.objectUrl;
    audio.preload = "auto";

    let sourceBuffer: SourceBuffer | null = null;
    const pending: Uint8Array[] = [];
    let appending = false;
    let readerDone = false;
    let setupFailed = false;

    const pumpAppend = () => {
      if (!sourceBuffer || appending || sourceBuffer.updating) return;
      const chunk = pending.shift();
      if (!chunk) {
        if (readerDone && mediaSource.readyState === "open") {
          try {
            mediaSource.endOfStream();
          } catch {
            /* already ending — ignore */
          }
        }
        return;
      }
      appending = true;
      try {
        sourceBuffer.appendBuffer(chunk as BufferSource);
      } catch {
        appending = false;
        setupFailed = true;
      }
    };

    await new Promise<void>((resolveOpen) => {
      mediaSource.addEventListener(
        "sourceopen",
        () => {
          try {
            sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          } catch {
            setupFailed = true;
            resolveOpen();
            return;
          }
          sourceBuffer.addEventListener("updateend", () => {
            appending = false;
            if (item.status === "fetching" && !setupFailed) {
              item.status = "ready";
              if (item.index === 0) this.timing?.mark("firstAudioReady");
              this.tryPlayNext();
            }
            pumpAppend();
          });
          resolveOpen();
        },
        { once: true },
      );
      audio.load();
    });

    if (setupFailed) throw new Error("MSE setup failed");
    if (this.cancelled) return;

    const reader = body.getReader();
    let firstByte = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (this.cancelled) return;
      if (done) {
        readerDone = true;
        pumpAppend();
        break;
      }
      if (value?.byteLength) {
        if (!firstByte && item.index === 0) {
          firstByte = true;
          this.timing?.mark("fishFirstByte");
        }
        item.cacheChunks.push(value);
        pending.push(value);
        pumpAppend();
      }
    }

    if (!this.cancelled && item.cacheChunks.length) {
      cacheSet(item.text, concatChunks(item.cacheChunks));
      item.cacheChunks = [];
    }
  }

  private tryPlayNext() {
    if (this.cancelled || this.currentlyPlaying) return;
    const item = this.items.find((it) => it.index === this.nextPlayIndex);
    if (!item) return;

    if (item.status === "error") {
      this.advancePast(item);
      this.tryPlayNext();
      return;
    }
    if (item.status !== "ready" || !item.audio) return;

    this.currentlyPlaying = true;
    item.status = "playing";
    const audio = item.audio;

    audio.onended = () => {
      item.status = "done";
      this.disposeItem(item);
      this.currentlyPlaying = false;
      this.advancePast(item);
      this.tryPlayNext();
    };
    audio.onerror = () => {
      item.status = "error";
      this.disposeItem(item);
      this.currentlyPlaying = false;
      this.advancePast(item);
      this.tryPlayNext();
    };

    if (item.index === 0) this.timing?.mark("playbackStarted");
    this.anyPlayed = true;
    void audio.play().catch(() => {
      item.status = "error";
      this.currentlyPlaying = false;
      this.advancePast(item);
      this.tryPlayNext();
    });
  }

  private advancePast(item: QueueItem) {
    if (item.index === this.nextPlayIndex) this.nextPlayIndex++;
    this.checkAllDone();
  }

  private checkAllDone() {
    if (!this.closed || this.cancelled) return;
    if (this.nextPlayIndex >= this.items.length) {
      this.timing?.mark("allAudioCompleted");
      this.timing?.logSummary();
      this.onAllDone?.(this.anyPlayed);
    }
  }

  private disposeItem(item: QueueItem) {
    if (item.audio) {
      item.audio.onended = null;
      item.audio.onerror = null;
    }
    if (item.objectUrl) {
      URL.revokeObjectURL(item.objectUrl);
      item.objectUrl = null;
    }
  }
}
