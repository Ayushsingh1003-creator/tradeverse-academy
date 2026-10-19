/**
 * Buffers streamed LLM text and yields complete sentences/phrases as soon as a
 * natural speech boundary (. ! ? or newline) appears, so TTS can start on
 * sentence 1 while the LLM is still generating sentence 2+.
 */
export const MIN_TTS_CHARS = 40;
export const MAX_TTS_CHARS = 150;

/** Sentence-ending punctuation, optionally followed by a closing quote/bracket, then whitespace or end-of-buffer. */
const SENTENCE_END_RE = /[.!?][)"'’”\]]*(?=\s|$)/g;

export class SentenceBuffer {
  private buf = "";

  /** Feed a streamed text delta; returns any complete sentences it completed. */
  push(delta: string): string[] {
    this.buf += delta;
    const out: string[] = [];

    let searchFrom = 0;
    for (;;) {
      const end = this.nextBoundary(searchFrom);
      if (end === -1) break;

      const candidate = this.buf.slice(0, end).trim();
      if (candidate.length < MIN_TTS_CHARS) {
        if (end >= this.buf.length) break; // no more buffered text to search — wait for next delta
        searchFrom = end; // keep scanning already-buffered text for a longer boundary
        continue;
      }

      out.push(candidate);
      this.buf = this.buf.slice(end);
      searchFrom = 0;
    }

    // Hard cap: a long run with no punctuation must not block TTS indefinitely.
    while (this.buf.length > MAX_TTS_CHARS) {
      const cut = this.lastWhitespaceBefore(MAX_TTS_CHARS);
      const candidate = this.buf.slice(0, cut).trim();
      if (!candidate) break;
      out.push(candidate);
      this.buf = this.buf.slice(cut);
    }

    return out;
  }

  /** Call once the LLM stream ends — returns any leftover text as a final sentence. */
  flush(): string | null {
    const rest = this.buf.trim();
    this.buf = "";
    return rest || null;
  }

  private nextBoundary(from: number): number {
    SENTENCE_END_RE.lastIndex = from;
    const m = SENTENCE_END_RE.exec(this.buf);
    const punctEnd = m ? m.index + m[0].length + (this.buf[m.index + m[0].length] === " " ? 1 : 0) : -1;

    const nlIdx = this.buf.indexOf("\n", from);
    const nlEnd = nlIdx === -1 ? -1 : nlIdx + 1;

    if (punctEnd === -1) return nlEnd;
    if (nlEnd === -1) return punctEnd;
    return Math.min(punctEnd, nlEnd);
  }

  /** Never split mid-word: back up to the last space at/before `limit`. */
  private lastWhitespaceBefore(limit: number): number {
    const idx = this.buf.slice(0, limit).lastIndexOf(" ");
    return idx === -1 ? limit : idx + 1;
  }
}
