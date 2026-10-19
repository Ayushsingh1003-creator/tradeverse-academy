import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Read env vars lazily (inside functions), not as top-level consts — ES module imports are
// hoisted and evaluated before the importing script's dotenv.config() calls run, so a
// top-level `const bucket = process.env.VOICE_S3_BUCKET` would always capture `undefined`.
function getBucket(): string {
  const bucket = process.env.VOICE_S3_BUCKET;
  if (!bucket) throw new Error("VOICE_S3_BUCKET is not set");
  return bucket;
}

function getRegion(): string {
  const region = process.env.VOICE_S3_REGION;
  if (!region) throw new Error("VOICE_S3_REGION is not set");
  return region;
}

function getClient(): S3Client {
  return new S3Client({
    region: getRegion(),
    endpoint: process.env.VOICE_S3_ENDPOINT?.trim() || undefined,
    credentials:
      process.env.VOICE_S3_ACCESS_KEY_ID && process.env.VOICE_S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.VOICE_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.VOICE_S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

function publicUrlFor(key: string): string {
  const base = process.env.VOICE_S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  return `https://${getBucket()}.s3.${getRegion()}.amazonaws.com/${key}`;
}

/** Uploads an MP3 buffer to `audio/{key}` and returns its public URL. */
export async function uploadVoiceClip(key: string, bytes: Buffer): Promise<string> {
  const fullKey = `audio/${key}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: fullKey,
      Body: bytes,
      ContentType: "audio/mpeg",
    }),
  );
  return publicUrlFor(fullKey);
}
