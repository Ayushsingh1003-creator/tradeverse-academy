"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { LESSONS } from "@/lib/data/lessons";
import { db } from "@/lib/db";
import { clampLessonImageWidthPercent, parseLessonImageAlign } from "@/lib/lessonImages";
function revalidateLessonPaths(lessonSlug: string) {
  const lesson = LESSONS.find((item) => item.slug === lessonSlug);
  revalidatePath("/admin/lessons");
  if (lesson) revalidatePath(`/admin/lessons/${lesson.id}`);
  revalidatePath(`/learn/${lessonSlug}`);
}

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

  revalidateLessonPaths(lessonSlug);
}

export async function removeLessonVideo(formData: FormData) {
  await guardAdmin();
  const lessonSlug = String(formData.get("lessonSlug") ?? "").trim();
  if (!lessonSlug) return;
  await db.lessonVideo.deleteMany({ where: { lessonSlug } });
  revalidateLessonPaths(lessonSlug);
}

export async function saveLessonImageSettings(formData: FormData) {
  await guardAdmin();
  const lessonSlug = String(formData.get("lessonSlug") ?? "").trim();
  const pageId = String(formData.get("pageId") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const widthPercent = clampLessonImageWidthPercent(Number(formData.get("widthPercent") ?? 100));
  const align = parseLessonImageAlign(String(formData.get("align") ?? "left"));

  if (!lessonSlug || !pageId || !alt) return;

  await db.lessonImage.upsert({
    where: { lessonSlug, pageId },
    create: { lessonSlug, pageId, alt, url, widthPercent, align },
    update: { alt, url, widthPercent, align, updatedAt: new Date() },
  });

  revalidateLessonPaths(lessonSlug);
}

/** @deprecated Use saveLessonImageSettings */
export async function saveLessonImageUrl(formData: FormData) {
  return saveLessonImageSettings(formData);
}
export async function removeLessonImageUrl(formData: FormData) {
  await guardAdmin();
  const lessonSlug = String(formData.get("lessonSlug") ?? "").trim();
  const pageId = String(formData.get("pageId") ?? "").trim();
  if (!lessonSlug || !pageId) return;

  await db.lessonImage.deleteMany({ where: { lessonSlug, pageId } });
  revalidateLessonPaths(lessonSlug);
}
