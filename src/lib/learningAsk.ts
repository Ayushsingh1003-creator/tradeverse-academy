import type { LearningAskPayload } from "@/lib/courseCatalog";

export async function getLearningAskRecommendation(
  query: string,
): Promise<LearningAskPayload> {
  const res = await fetch("/api/learning-ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.trim() }),
  });

  if (!res.ok) {
    throw new Error("learning_ask_failed");
  }

  return (await res.json()) as LearningAskPayload;
}
