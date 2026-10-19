import { isTradingRelatedQuery } from "@/lib/tradingTopics";
import { TUTOR_MAX_TOKENS, TUTOR_SYSTEM_PROMPT, TUTOR_TEMPERATURE } from "@/lib/tutorPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TutorBody = {
  lessonTitle?: string;
  lessonTopic?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  isWrongAttempt?: boolean;
};

const OFF_TOPIC_REPLY =
  "That is outside what Tradeverse Academy covers. I am here to help you learn trading, markets, and risk management.";

const TRADING_KEYWORDS = [
  "hint",
  "lesson",
  "practice",
  "example",
  "answer",
  "question",
  "retry",
  "wrong",
];

function isTradingPrompt(text: string) {
  if (isTradingRelatedQuery(text)) return true;
  const q = text.toLowerCase();
  return TRADING_KEYWORDS.some((kw) => q.includes(kw));
}

/** Wrong-attempt hints and lesson context are always in-scope for the tutor. */
function isOnTopicRequest(body: TutorBody) {
  if (body.isWrongAttempt) return true;

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (isTradingPrompt(prompt)) return true;

  const lessonTitle = String(body.lessonTitle ?? "");
  const lessonTopic = String(body.lessonTopic ?? "");
  if (isTradingPrompt(lessonTitle) || isTradingPrompt(lessonTopic)) return true;

  for (const message of body.messages ?? []) {
    if (message.role !== "user") continue;
    if (isTradingPrompt(String(message.content ?? ""))) return true;
  }

  return false;
}

function normalizeMessages(
  prompt: string,
  messages: TutorBody["messages"],
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  if (prompt) return [{ role: "user", content: prompt }];
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => typeof m?.content === "string");
}

/** Parses a `data: {...}\n\n`-framed SSE byte stream into raw JSON payload strings. */
async function* readSseFrames(body: ReadableStream<Uint8Array>, signal: AbortSignal): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      if (signal.aborted) return;
      const { done, value } = await reader.read();
      if (done) break;
      // Normalize CRLF to LF — Google's SSE responses use \r\n\r\n frame delimiters.
      buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let idx: number;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const line = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (payload) yield payload;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function* streamGeminiChunks(
  apiKey: string,
  model: string,
  version: string,
  combinedPrompt: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: combinedPrompt }] }] }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`gemini_http_${res.status}`);

  for await (const payload of readSseFrames(res.body, signal)) {
    try {
      const json = JSON.parse(payload) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };
      if (json.error?.message) throw new Error(json.error.message);
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text) yield text;
    } catch {
      // malformed/partial SSE frame — skip it
    }
  }
}

async function* streamCerebrasChunks(
  apiKey: string,
  model: string,
  systemWithContext: string,
  userMessages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: TUTOR_TEMPERATURE,
      max_tokens: TUTOR_MAX_TOKENS,
      stream: true,
      messages: [{ role: "system", content: systemWithContext }, ...userMessages],
    }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`cerebras_http_${res.status}`);

  for await (const payload of readSseFrames(res.body, signal)) {
    if (payload === "[DONE]") return;
    try {
      const json = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string } }>;
        error?: { message?: string };
      };
      if (json.error?.message) throw new Error(json.error.message);
      const delta = json.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta) yield delta;
    } catch {
      // malformed/partial SSE frame — skip it
    }
  }
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  let body: TutorBody;
  try {
    body = (await req.json()) as TutorBody;
  } catch {
    body = {};
  }

  const lessonTitle = String(body.lessonTitle ?? "");
  const lessonTopic = String(body.lessonTopic ?? "");
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const isWrongAttempt = Boolean(body.isWrongAttempt);
  const userMessages = normalizeMessages(prompt, body.messages);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (obj: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      const abortController = new AbortController();
      const onClientAbort = () => abortController.abort();
      req.signal?.addEventListener("abort", onClientAbort);

      try {
        if (!isOnTopicRequest(body)) {
          send({ type: "chunk", text: OFF_TOPIC_REPLY, source: "fallback" });
          send({ type: "done", source: "fallback" });
          finish();
          return;
        }

        const systemWithContext = `${TUTOR_SYSTEM_PROMPT}

Current lesson: "${lessonTitle}"
Current topic: "${lessonTopic}"
Wrong attempt: ${isWrongAttempt ? "yes — keep reply extra short" : "no"}`;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const cerebrasApiKey = process.env.CEREBRAS_API_KEY;
        const cerebrasModel = process.env.CEREBRAS_MODEL ?? "llama-3.1-8b";

        let usedGemini = false;

        if (geminiApiKey) {
          const promptBlock = userMessages.map((m) => `${m.role}: ${m.content}`).join("\n");
          const combinedPrompt = `${systemWithContext}\n\n${promptBlock}`;
          const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
          const versions = ["v1beta", "v1"] as const;

          outer: for (const version of versions) {
            for (const model of models) {
              try {
                for await (const delta of streamGeminiChunks(geminiApiKey, model, version, combinedPrompt, abortController.signal)) {
                  if (!usedGemini) {
                    usedGemini = true;
                    send({ type: "source", source: "gemini" });
                  }
                  send({ type: "chunk", text: delta, source: "gemini" });
                }
                if (usedGemini) break outer;
              } catch (err) {
                if (abortController.signal.aborted) return;
                console.error("[ai-tutor] Gemini stream error", {
                  model,
                  version,
                  error: err instanceof Error ? err.message : err,
                });
                if (usedGemini) {
                  // Already streamed real content — don't switch engines mid-reply, just stop here.
                  send({ type: "error", message: "gemini_stream_interrupted" });
                  break outer;
                }
                // else: try the next model/version, then fall through to Cerebras.
              }
            }
          }
        }

        if (abortController.signal.aborted) return;

        if (!usedGemini) {
          if (!cerebrasApiKey) {
            send({ type: "error", message: "no_provider_configured" });
            send({ type: "done", source: "fallback" });
            finish();
            return;
          }

          try {
            let usedCerebras = false;
            for await (const delta of streamCerebrasChunks(
              cerebrasApiKey,
              cerebrasModel,
              systemWithContext,
              userMessages,
              abortController.signal,
            )) {
              if (!usedCerebras) {
                usedCerebras = true;
                send({ type: "source", source: "cerebras" });
              }
              send({ type: "chunk", text: delta, source: "cerebras" });
            }

            if (!usedCerebras) {
              send({ type: "error", message: "empty_ai_response" });
              send({ type: "done", source: "fallback" });
              finish();
              return;
            }

            send({ type: "done", source: "cerebras" });
            finish();
            return;
          } catch (err) {
            if (abortController.signal.aborted) return;
            console.error("[ai-tutor] Cerebras stream error", err);
            send({ type: "error", message: err instanceof Error ? err.message : "cerebras_failed" });
            send({ type: "done", source: "fallback" });
            finish();
            return;
          }
        }

        send({ type: "done", source: "gemini" });
        finish();
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("[ai-tutor] Unexpected stream error", err);
          send({ type: "error", message: "unexpected_server_error" });
          send({ type: "done", source: "fallback" });
        }
        finish();
      } finally {
        req.signal?.removeEventListener("abort", onClientAbort);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
