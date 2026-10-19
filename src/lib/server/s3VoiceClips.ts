import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const region = process.env.VOICE_S3_REGION;
  if (!region) throw new Error("VOICE_S3_REGION is not set");
  client = new S3Client({
    region,
    endpoint: process.env.VOICE_S3_ENDPOINT?.trim() || undefined,
    credentials:
      process.env.VOICE_S3_ACCESS_KEY_ID && process.env.VOICE_S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.VOICE_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.VOICE_S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  return client;
}

type CachedClip = { body: Buffer; contentType: string; cacheStatus: "HIT" | "MISS" };

// Clips are static (a given key's content never changes), so cache bytes
// in-process to avoid re-fetching from S3 on every request. Bounded FIFO
// eviction keeps this from growing unbounded across a long-running process.
// Note: on serverless (e.g. Vercel), this only helps when the same warm
// container handles the request — it does not persist across cold starts
// or across concurrently-scaled instances.
const CACHE_MAX_ENTRIES = 500;
const cache = new Map<string, Omit<CachedClip, "cacheStatus">>();

/** Fetches `audio/{key}` from the (private) voice-clips bucket, cached in-process. Returns null if the object doesn't exist. */
export async function fetchVoiceClip(key: string): Promise<CachedClip | null> {
  const cached = cache.get(key);
  if (cached) return { ...cached, cacheStatus: "HIT" };

  const bucket = process.env.VOICE_S3_BUCKET;
  if (!bucket) throw new Error("VOICE_S3_BUCKET is not set");

  try {
    const res = await getClient().send(new GetObjectCommand({ Bucket: bucket, Key: `audio/${key}` }));
    if (!res.Body) return null;
    const clip = {
      body: Buffer.from(await res.Body.transformToByteArray()),
      contentType: res.ContentType ?? "audio/mpeg",
    };

    if (cache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    cache.set(key, clip);
    return { ...clip, cacheStatus: "MISS" };
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw err;
  }
}
