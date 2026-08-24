import { getAuthUserId } from "@/lib/auth/session";
import { isLessonGatedForRequester } from "@/lib/premium/lessonAccess";
import { fetchVoiceClip } from "@/lib/server/s3VoiceClips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gated proxy for pre-generated hint/wrong/correct audio clips — the S3
 * bucket that holds them is private, so every request must go through here
 * rather than a public S3 URL. Two shapes:
 *   /api/voice/clip/prefix/{hint|wrong|correct}
 *   /api/voice/clip/lesson/{lessonSlug}/{questionKey}/{stage}
 * Both require a logged-in user; the lesson shape additionally requires the
 * lesson's course to be free or the requester to have Premium — the same
 * rule that gates the lesson page itself (src/lib/premium/lessonAccess.ts).
 */
export async function GET(req: Request, { params }: { params: { segments: string[] } }) {
  const userId = await getAuthUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const [kind, ...rest] = params.segments;

  let s3Key: string | null = null;
  if (kind === "prefix" && rest.length === 1) {
    const [prefixKind] = rest;
    if (["hint", "wrong", "correct"].includes(prefixKind)) {
      s3Key = `_prefix/${prefixKind}.mp3`;
    }
  } else if (kind === "lesson" && rest.length === 3) {
    const [lessonSlug, questionKey, stage] = rest;
    if (["hint", "explain"].includes(stage)) {
      if (await isLessonGatedForRequester(lessonSlug)) {
        return new Response("Premium required", { status: 403 });
      }
      s3Key = `${lessonSlug}/${questionKey}-${stage}.mp3`;
    }
  }

  if (!s3Key) return new Response("Not found", { status: 404 });

  const clip = await fetchVoiceClip(s3Key);
  if (!clip) return new Response("Not found", { status: 404 });

  return new Response(clip.body as unknown as BodyInit, {
    headers: {
      "Content-Type": clip.contentType,
      // Private: safe to cache in the requester's own browser, never in a shared/public cache.
      "Cache-Control": "private, max-age=86400, immutable",
    },
  });
}
