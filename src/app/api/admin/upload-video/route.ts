import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await guardAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    lessonSlug?: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
    duration?: number;
    thumbnail?: string;
  };
  if (!body.lessonSlug || !body.muxAssetId || !body.muxPlaybackId) {
    return NextResponse.json({ error: "lessonSlug, muxAssetId, muxPlaybackId required" }, { status: 400 });
  }

  const row = await db.lessonVideo.upsert({
    where: { lessonSlug: body.lessonSlug },
    create: {
      lessonSlug: body.lessonSlug,
      muxAssetId: body.muxAssetId,
      muxPlaybackId: body.muxPlaybackId,
      duration: body.duration ?? 0,
      thumbnail: body.thumbnail ?? null,
    },
    update: {
      muxAssetId: body.muxAssetId,
      muxPlaybackId: body.muxPlaybackId,
      duration: body.duration ?? 0,
      thumbnail: body.thumbnail ?? null,
    },
  });

  return NextResponse.json({ video: row });
}
