import { TUTOR_MAX_TOKENS, TUTOR_SYSTEM_PROMPT, TUTOR_TEMPERATURE } from "@/lib/tutorPrompt";

type TutorBody = {
  lessonTitle?: string;
  lessonTopic?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  isWrongAttempt?: boolean;
};

function normalizeMessages(
  prompt: string,
  messages: TutorBody["messages"],
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  if (prompt) return [{ role: "user", content: prompt }];
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => typeof m?.content === "string");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TutorBody;
    const lessonTitle = String(body.lessonTitle ?? "");
    const lessonTopic = String(body.lessonTopic ?? "");
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const isWrongAttempt = Boolean(body.isWrongAttempt);
    const userMessages = normalizeMessages(prompt, body.messages);

    const apiKey = process.env.CEREBRAS_API_KEY;
    const model = process.env.CEREBRAS_MODEL ?? "llama-3.1-8b";
    if (!apiKey) {
      return Response.json(
        { fallback: true, source: "fallback", reason: "missing_cerebras_api_key" },
        { status: 200 },
      );
    }

    const systemWithContext = `${TUTOR_SYSTEM_PROMPT}

Current lesson: "${lessonTitle}"
Current topic: "${lessonTopic}"
Wrong attempt: ${isWrongAttempt ? "yes — keep reply extra short" : "no"}`;

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: TUTOR_TEMPERATURE,
        max_tokens: TUTOR_MAX_TOKENS,
        messages: [{ role: "system", content: systemWithContext }, ...userMessages],
      }),
    });

    if (!response.ok) {
      return Response.json(
        { fallback: true, source: "fallback", reason: "cerebras_http_error" },
        { status: 200 },
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = String(json.choices?.[0]?.message?.content ?? "").trim();

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
