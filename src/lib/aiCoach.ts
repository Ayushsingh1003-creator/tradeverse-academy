import { matchAiResponse } from "@/lib/lessonAiResponses";

export type CoachTurn = { role: "user" | "coach"; text: string };

type CoachRequest = {
  prompt: string;
  lessonTitle: string;
  lessonTopic: string;
  history: CoachTurn[];
  isWrongAttempt?: boolean;
};

function fallbackCoachReply(prompt: string, isWrongAttempt = false) {
  const base = matchAiResponse(prompt);
  if (!isWrongAttempt) return base;
  return `Wrong — try again. ${base}`;
}

export async function getCoachReply({
  prompt,
  lessonTitle,
  lessonTopic,
  history,
  isWrongAttempt = false,
}: CoachRequest): Promise<{ text: string; source: "cerebras" | "fallback" }> {
  try {
    const messages = history.map((item) => ({
      role: item.role === "coach" ? "assistant" : "user",
      content: item.text,
    }));

    const res = await fetch("/api/ai-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        lessonTitle,
        lessonTopic,
        isWrongAttempt,
        messages,
      }),
    });

    if (!res.ok) {
      return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
    }

    const data = (await res.json()) as {
      fallback?: boolean;
      reply?: string;
      source?: "cerebras" | "fallback";
    };

    if (data.fallback || !data.reply?.trim()) {
      return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
    }

    return { text: data.reply.trim(), source: data.source === "cerebras" ? "cerebras" : "fallback" };
  } catch {
    return { text: fallbackCoachReply(prompt, isWrongAttempt), source: "fallback" };
  }
}
