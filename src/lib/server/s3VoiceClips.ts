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

/** Streams `audio/{key}` from the (private) voice-clips bucket. Returns null if the object doesn't exist. */
export async function fetchVoiceClip(key: string): Promise<{ body: ReadableStream; contentType: string } | null> {
  const bucket = process.env.VOICE_S3_BUCKET;
  if (!bucket) throw new Error("VOICE_S3_BUCKET is not set");

  try {
    const res = await getClient().send(new GetObjectCommand({ Bucket: bucket, Key: `audio/${key}` }));
    if (!res.Body) return null;
    return {
      body: res.Body.transformToWebStream(),
      contentType: res.ContentType ?? "audio/mpeg",
    };
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw err;
  }
}
