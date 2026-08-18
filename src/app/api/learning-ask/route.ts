import {
  buildCourseCatalogForAI,
  enrichRecommendation,
  fallbackLearningAsk,
  type LearningAskPayload,
} from "@/lib/courseCatalog";
import { isTradingRelatedQuery } from "@/lib/tradingTopics";

type AskBody = { query?: string };

type RawAiJson = {
  shortAnswer?: string;
  intro?: string;
  courseSlug?: string;
  lessonSlug?: string;
  courseDescription?: string;
  lessonDescription?: string;
  relatedQuestions?: string[];
  experienceQuestion?: string;
  experienceOptions?: { beginner?: string; basic?: string };
};

function extractJson(text: string): RawAiJson | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as RawAiJson;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are Tradeverse Academy's learning guide. Given a user's learning question, pick the best matching COURSE and LESSON from the catalog below.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "shortAnswer": "1-2 sentences — direct, precise answer to the user's question in plain language",
  "intro": "1 friendly sentence introducing your course recommendations",
  "courseSlug": "exact course slug from catalog",
  "lessonSlug": "exact lesson slug from catalog (sub-course)",
  "courseDescription": "one sentence why start with this course",
  "lessonDescription": "one sentence why this specific lesson helps their question",
  "relatedQuestions": ["short follow-up question 1", "short follow-up question 2"],
  "experienceQuestion": "How much experience do you already have with [topic]? — frame naturally for their question",
  "experienceOptions": {
    "beginner": "Starting from scratch",
    "basic": "I know the basics"
  }
}

Rules:
- shortAnswer must directly answer what the user asked before recommending courses.
- courseSlug and lessonSlug MUST exist in the catalog exactly.
- lessonSlug should belong to the chosen course.
- relatedQuestions: two short, clickable questions related to what the user asked (not generic).
- experienceOptions.beginner = complete beginner label; experienceOptions.basic = has some prior knowledge.
- Keep shortAnswer factual and concise. Keep intro warm like Brilliant.org.`;

async function tryGemini(query: string, catalog: string): Promise<RawAiJson | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const userPrompt = `${SYSTEM_PROMPT}

CATALOG:
${catalog}

USER QUESTION: ${query}`;

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
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
          }),
        });
        if (!response.ok) continue;
        const json = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = extractJson(text);
        if (parsed) return parsed;
      } catch {
        continue;
      }
    }
  }
  return null;
}

async function tryCerebras(query: string, catalog: string): Promise<RawAiJson | null> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;
  const model = process.env.CEREBRAS_MODEL ?? "llama-3.1-8b";

  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `CATALOG:\n${catalog}\n\nUSER QUESTION: ${query}`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    return extractJson(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AskBody;
    const query = String(body.query ?? "").trim();

    if (!isTradingRelatedQuery(query)) {
      const fb = fallbackLearningAsk("learn trading basics");
      return Response.json({
        ...fb,
        shortAnswer:
          "Tradeverse Academy focuses on trading, markets, and risk management for Indian markets.",
        intro:
          "Here is a great place to start learning.",
      } satisfies LearningAskPayload);
    }

    const catalog = buildCourseCatalogForAI();
    const raw = (await tryGemini(query, catalog)) ?? (await tryCerebras(query, catalog));
    const enriched = raw ? enrichRecommendation(raw) : null;

    if (enriched) {
      return Response.json({ ...enriched, fallback: false } satisfies LearningAskPayload);
    }

    return Response.json(fallbackLearningAsk(query));
  } catch {
    return Response.json(fallbackLearningAsk(""));
  }
}
