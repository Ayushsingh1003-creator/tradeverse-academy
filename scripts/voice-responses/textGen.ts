import { TUTOR_MAX_TOKENS, TUTOR_SYSTEM_PROMPT, TUTOR_TEMPERATURE } from "@/lib/tutorPrompt";

export type QuestionContext = { question: string; options?: string[]; correctAnswer?: string };
export type ReplyStage = "hint" | "explain";

function buildUserMessage(ctx: QuestionContext, stage: ReplyStage): string {
  const optionsText = ctx.options?.length ? ` Options were: ${ctx.options.join(", ")}.` : "";
  if (stage === "hint") {
    return `A learner got this question wrong on their first try: "${ctx.question}".${optionsText} Give me one short hint — don't tell me the answer — so they can retry.`;
  }
  // Tap/drag-type questions have no correctAnswer string — explain the underlying concept instead
  // of a specific option, so the prompt never claims "the correct answer is ''".
  const answerClause = ctx.correctAnswer
    ? ` The correct answer is "${ctx.correctAnswer}". Briefly explain why.`
    : " There is no multiple-choice answer for this one — it's a tap/drag interaction. Briefly explain the underlying concept the learner needs to correctly complete it.";
  return `A learner got this question wrong again: "${ctx.question}".${optionsText}${answerClause}`;
}

/** v1beta only — v1 hits the exact same per-model daily quota bucket, so trying both just wastes calls. */
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

async function tryGemini(systemWithContext: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemWithContext}\n\nuser: ${userMessage}` }] }],
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        // 429 here is Gemini's free-tier daily-per-model quota (not a burst rate limit) —
        // retrying within the same run can't help, so just move on to the next model.
        console.warn(`  [gemini ${model}] HTTP ${res.status}: ${detail.slice(0, 200)}`);
        continue;
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        promptFeedback?: { blockReason?: string };
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
      console.warn(`  [gemini ${model}] empty response (blockReason: ${json.promptFeedback?.blockReason ?? "none"})`);
    } catch (err) {
      console.warn(`  [gemini ${model}] request failed: ${err instanceof Error ? err.message : err}`);
      continue;
    }
  }
  return null;
}

async function callCerebras(apiKey: string, model: string, systemWithContext: string, userMessage: string, maxTokens: number) {
  return fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: TUTOR_TEMPERATURE,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemWithContext },
        { role: "user", content: userMessage },
      ],
    }),
  });
}

/**
 * Cerebras's 429 is a genuine per-minute burst limit (unlike Gemini's daily quota), so one
 * retry-with-backoff is worthwhile. Separately, gpt-oss-120b sometimes still spends more of
 * its budget on invisible reasoning than TUTOR_MAX_TOKENS allows for a specific prompt —
 * `finish_reason: "length"` means the visible answer got cut off, so retry once with a much
 * larger budget rather than silently accepting truncated text.
 */
async function tryCerebras(systemWithContext: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;
  const model = process.env.CEREBRAS_MODEL ?? "llama-3.1-8b";
  const tokenBudgets = [TUTOR_MAX_TOKENS, 1200];

  for (let i = 0; i < tokenBudgets.length; i++) {
    const maxTokens = tokenBudgets[i];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await callCerebras(apiKey, model, systemWithContext, userMessage, maxTokens);
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.warn(`  [cerebras] HTTP ${res.status}: ${detail.slice(0, 200)}`);
          if (res.status === 429 && attempt === 0) {
            console.warn("  [cerebras] rate limited — waiting 15s before one retry");
            await new Promise((r) => setTimeout(r, 15_000));
            continue;
          }
          return null;
        }
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        const finishReason = json.choices?.[0]?.finish_reason;
        if (text && finishReason === "length") {
          console.warn(`  [cerebras] truncated at max_tokens=${maxTokens} (finish_reason: length) — retrying with more budget`);
          break; // move to the next (larger) token budget
        }
        if (text) return text;
        console.warn(`  [cerebras] empty response (finish_reason: ${finishReason ?? "unknown"})`);
        return null;
      } catch (err) {
        console.warn(`  [cerebras] request failed: ${err instanceof Error ? err.message : err}`);
        return null;
      }
    }
  }
  return null;
}

/** Generates one hint/explain reply for a fixed question — Gemini first, Cerebras fallback. Same prompt shape as the live /api/ai-tutor route. */
export async function generateQuestionReply(
  lessonTitle: string,
  lessonTopic: string,
  ctx: QuestionContext,
  stage: ReplyStage,
): Promise<string | null> {
  const systemWithContext = `${TUTOR_SYSTEM_PROMPT}

Current lesson: "${lessonTitle}"
Current topic: "${lessonTopic}"
Wrong attempt: yes — keep reply extra short`;
  const userMessage = buildUserMessage(ctx, stage);

  return (await tryGemini(systemWithContext, userMessage)) ?? (await tryCerebras(systemWithContext, userMessage));
}
