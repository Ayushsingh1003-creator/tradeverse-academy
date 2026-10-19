import { db } from "@/lib/db";
import type { QuestionVoiceMap, VoicePrefixMap } from "@/lib/answerVoiceFeedback";
import type { QuestionVoiceResponse, VoicePrefix } from "@/lib/db";

/**
 * The voice-clips S3 bucket is private — the client never sees a raw S3 URL,
 * only this gated proxy path (see src/app/api/voice/clip/[...segments]/route.ts),
 * which re-derives the same S3 key and checks auth/Premium before streaming it.
 */
function lessonClipUrl(lessonSlug: string, questionKey: string, stage: "hint" | "explain"): string {
  return `/api/voice/clip/lesson/${encodeURIComponent(lessonSlug)}/${encodeURIComponent(questionKey)}/${stage}`;
}

function prefixClipUrl(kind: "hint" | "wrong" | "correct"): string {
  return `/api/voice/clip/prefix/${kind}`;
}

export async function fetchQuestionVoiceMap(lessonSlug: string): Promise<QuestionVoiceMap> {
  try {
    const rows = (await db.questionVoiceResponse.findMany({ where: { lessonSlug } })) as QuestionVoiceResponse[];
    const map: QuestionVoiceMap = {};
    for (const row of rows) {
      if (row.stage !== "hint" && row.stage !== "explain") continue;
      map[row.questionKey] = {
        ...map[row.questionKey],
        [row.stage]: { text: row.text, audioUrl: lessonClipUrl(row.lessonSlug, row.questionKey, row.stage) },
      };
    }
    return map;
  } catch {
    return {};
  }
}

export async function fetchVoicePrefixes(): Promise<VoicePrefixMap> {
  try {
    const rows = (await db.voicePrefix.findMany({})) as VoicePrefix[];
    const map: VoicePrefixMap = {};
    for (const row of rows) {
      if (row.kind !== "hint" && row.kind !== "wrong" && row.kind !== "correct") continue;
      map[row.kind] = { text: row.text, audioUrl: prefixClipUrl(row.kind) };
    }
    return map;
  } catch {
    return {};
  }
}
