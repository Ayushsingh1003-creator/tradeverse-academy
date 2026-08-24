import { matchAiResponse } from "@/lib/lessonAiResponses";
import type { CoachTiming } from "@/lib/coachTiming";

export type CoachTurn = { role: "user" | "coach"; text: string };

type CoachRequest = {
  prompt: string;
  lessonTitle: string;
  lessonTopic: string;
  history: CoachTurn[];
  isWrongAttempt?: boolean;
};

type StreamEvent =
  | { type: "chunk"; text: string; source: "gemini" | "cerebras" | "fallback" }
  | { type: "source"; source: "gemini" | "cerebras" }
  | { type: "error"; message: string }
  | { type: "done"; source: "gemini" | "cerebras" | "fallback" };

function fallbackCoachReply(prompt: string, isWrongAttempt = false) {
  const base = matchAiResponse(prompt);
  if (!isWrongAttempt) return base;
  return `Wrong — try again. ${base}`;
}

/** Parses `data: {...}\n\n`-framed SSE bytes from the /api/ai-tutor stream into event objects. */
async function* readTutorStream(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const line = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          yield JSON.parse(payload) as StreamEvent;
        } catch {
          // malformed frame — skip it
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Streams the coach's reply, calling onChunk as soon as each text delta
 * arrives — the caller can start TTS on the first sentence long before the
 * full reply is generated. Resolves once the stream ends with the full text
 * and whichever provider produced it (falling back to the local canned
 * responder if neither provider returned anything usable).
 */
export async function streamCoachReply(
  { prompt, lessonTitle, lessonTopic, history, isWrongAttempt = false }: CoachRequest,
  onChunk: (text: string) => void,
  opts: { signal?: AbortSignal; timing?: CoachTiming } = {},
): Promise<{ text: string; source: "gemini" | "cerebras" | "fallback" }> {
  const offTopicPhrase = "outside what Tradeverse Academy covers";
  let fullText = "";
  let source: "gemini" | "cerebras" | "fallback" = "fallback";
  let firstTokenMarked = false;

  try {
    const messages = history.map((item) => ({
      role: item.role === "coach" ? ("assistant" as const) : ("user" as const),
      content: item.text,
    }));

    const res = await fetch("/api/ai-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, lessonTitle, lessonTopic, isWrongAttempt, messages }),
      signal: opts.signal,
    });

    if (!res.ok || !res.body) {
      return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
    }

    for await (const event of readTutorStream(res.body)) {
      if (event.type === "source") {
        source = event.source;
      } else if (event.type === "chunk") {
        fullText += event.text;
        if (!firstTokenMarked) {
          firstTokenMarked = true;
          opts.timing?.mark("llmFirstToken");
        }
        // Defensive: the model can still emit the canned off-topic line verbatim even on a
        // wrong-attempt request (which always passes the server's on-topic gate) — catch it
        // as soon as it's recognizable and fall back locally instead of speaking/showing it.
        if (isWrongAttempt && fullText.includes(offTopicPhrase)) {
          return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
        }
        onChunk(event.text);
      } else if (event.type === "done") {
        source = event.source;
      }
    }
  } catch {
    if (opts.signal?.aborted) return { text: fullText, source };
    return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
  }

  opts.timing?.mark("llmCompleted");

  const reply = fullText.trim();
  if (!reply) {
    return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
  }

  return { text: reply, source };
}
