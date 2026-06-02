import { TUTOR_MAX_TOKENS, TUTOR_SYSTEM_PROMPT, TUTOR_TEMPERATURE } from "@/lib/tutorPrompt";

type TutorBody = {
  lessonTitle?: string;
  lessonTopic?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  isWrongAttempt?: boolean;
};

type TutorCompletionResponse = {
  choices?: Array<{ message?: { content?: string; reasoning?: string } }>;
  error?: { message?: string };
};
type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

const OFF_TOPIC_REPLY =
  "That is outside what Tradeverse Academy covers. I am here to help you learn trading, markets, and risk management.";

const TRADING_KEYWORDS = [
  "trade",
  "trading",
  "market",
  "stock",
  "candle",
  "candlestick",
  "chart",
  "price",
  "support",
  "resistance",
  "rsi",
  "macd",
  "indicator",
  "risk",
  "reward",
  "position",
  "stop loss",
  "broker",
  "nse",
  "bse",
  "demat",
  "leverage",
  "forex",
  "crypto",
  "futures",
  "options",
];

function isTradingPrompt(text: string) {
  const q = text.toLowerCase();
  if (!q.trim()) return true;
  return TRADING_KEYWORDS.some((kw) => q.includes(kw));
}

function normalizeMessages(
  prompt: string,
  messages: TutorBody["messages"],
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  if (prompt) return [{ role: "user", content: prompt }];
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => typeof m?.content === "string");
}

async function tryGeminiReply({
  apiKey,
  systemWithContext,
  userMessages,
}: {
  apiKey: string;
  systemWithContext: string;
  userMessages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}): Promise<{ reply: string | null; reason?: string }> {
  const promptBlock = userMessages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const combinedPrompt = `${systemWithContext}\n\n${promptBlock}`;
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  const versions = ["v1beta", "v1"] as const;

  for (const version of versions) {
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
          }),
        });

        const rawText = await response.text();
        let json: GeminiGenerateResponse | null = null;
        try {
          json = rawText ? (JSON.parse(rawText) as GeminiGenerateResponse) : null;
        } catch {
          json = null;
        }

        if (!response.ok) {
          console.error("[ai-tutor] Gemini HTTP error", {
            status: response.status,
            statusText: response.statusText,
            model,
            version,
            error: json?.error?.message ?? rawText.slice(0, 500),
          });
          continue;
        }

        const reply = String(json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
        if (reply) return { reply };
      } catch (error) {
        console.error("[ai-tutor] Gemini request failed", { model, version, error });
      }
    }
  }

  return { reply: null, reason: "gemini_failed" };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TutorBody;
    const lessonTitle = String(body.lessonTitle ?? "");
    const lessonTopic = String(body.lessonTopic ?? "");
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const isWrongAttempt = Boolean(body.isWrongAttempt);
    const userMessages = normalizeMessages(prompt, body.messages);
    if (!isTradingPrompt(prompt)) {
      return Response.json({ fallback: false, source: "fallback", reply: OFF_TOPIC_REPLY }, { status: 200 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const cerebrasApiKey = process.env.CEREBRAS_API_KEY;
    const cerebrasModel = process.env.CEREBRAS_MODEL ?? "llama-3.1-8b";

    const systemWithContext = `${TUTOR_SYSTEM_PROMPT}

Current lesson: "${lessonTitle}"
Current topic: "${lessonTopic}"
Wrong attempt: ${isWrongAttempt ? "yes — keep reply extra short" : "no"}`;

    if (geminiApiKey) {
      const geminiResult = await tryGeminiReply({
        apiKey: geminiApiKey,
        systemWithContext,
        userMessages,
      });
      if (geminiResult.reply) {
        return Response.json({ fallback: false, source: "gemini", reply: geminiResult.reply }, { status: 200 });
      }
    }

    if (!cerebrasApiKey) {
      return Response.json(
        { fallback: true, source: "fallback", reason: "missing_cerebras_api_key_after_gemini" },
        { status: 200 },
      );
    }

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cerebrasApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cerebrasModel,
        temperature: TUTOR_TEMPERATURE,
        max_tokens: TUTOR_MAX_TOKENS,
        messages: [{ role: "system", content: systemWithContext }, ...userMessages],
      }),
    });

    const rawText = await response.text();
    let json: TutorCompletionResponse | null = null;
    try {
      json = rawText ? (JSON.parse(rawText) as TutorCompletionResponse) : null;
    } catch {
      json = null;
    }

    if (!response.ok) {
      console.error("[ai-tutor] Cerebras HTTP error", {
        status: response.status,
        statusText: response.statusText,
        error: json?.error?.message ?? rawText.slice(0, 500),
      });
      return Response.json(
        { fallback: true, source: "fallback", reason: `cerebras_http_${response.status}` },
        { status: 200 },
      );
    }

    const message = json?.choices?.[0]?.message;
    const reply = String(message?.content ?? message?.reasoning ?? "").trim();

    if (!reply) {
      return Response.json(
        { fallback: true, source: "fallback", reason: "empty_ai_response" },
        { status: 200 },
      );
    }

    return Response.json({ fallback: false, source: "cerebras", reply }, { status: 200 });
  } catch {
    return Response.json(
      { fallback: true, source: "fallback", reason: "unexpected_server_error" },
      { status: 200 },
    );
  }
}
