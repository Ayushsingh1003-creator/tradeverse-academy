import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const video = await db.lessonVideo.findUnique({ where: { lessonSlug: params.slug } });
  if (!video) return NextResponse.json({ video: null });
  return NextResponse.json({
    video: { playbackId: video.muxPlaybackId, duration: video.duration, thumbnail: video.thumbnail },
  });
}
