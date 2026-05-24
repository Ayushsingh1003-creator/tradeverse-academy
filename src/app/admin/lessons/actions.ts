"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";

export async function saveLessonVideo(formData: FormData) {
  await guardAdmin();
  const lessonSlug = String(formData.get("lessonSlug") ?? "").trim();
  const muxAssetId = String(formData.get("muxAssetId") ?? "").trim();
  const muxPlaybackId = String(formData.get("muxPlaybackId") ?? "").trim();
  const duration = Number(formData.get("duration") ?? 0) || 0;
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null;

  if (!lessonSlug || !muxAssetId || !muxPlaybackId) {
    return;
  }

  await db.lessonVideo.upsert({
    where: { lessonSlug },
    create: {
      lessonSlug,
      muxAssetId,
      muxPlaybackId,
      duration,
      thumbnail,
    },
    update: {
      muxAssetId,
      muxPlaybackId,
      duration,
      thumbnail,
    },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/lessons/${lessonSlug}`);
}

export async function removeLessonVideo(formData: FormData) {
  await guardAdmin();
  const lessonSlug = String(formData.get("lessonSlug") ?? "").trim();
  if (!lessonSlug) return;
  await db.lessonVideo.deleteMany({ where: { lessonSlug } });
  revalidatePath("/admin/lessons");
}
