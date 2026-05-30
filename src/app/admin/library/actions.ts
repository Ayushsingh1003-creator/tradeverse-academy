"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";
import { parseYoutubeVideoId, youtubeThumbnailUrl } from "@/lib/youtubeEmbed";

function tagsToJson(raw: string): string {
  const parts = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(parts);
}

function parseYoutubeUrls(formData: FormData) {
  const enRaw = String(formData.get("youtubeUrlEn") ?? formData.get("youtubeVideoId") ?? "").trim();
  const hiRaw = String(formData.get("youtubeUrlHi") ?? "").trim();

  const youtubeVideoId = parseYoutubeVideoId(enRaw);
  if (!youtubeVideoId) {
    throw new Error("Invalid English YouTube URL");
  }

  let youtubeVideoIdHi: string | null = null;
  if (hiRaw) {
    youtubeVideoIdHi = parseYoutubeVideoId(hiRaw);
    if (!youtubeVideoIdHi) {
      throw new Error("Invalid Hindi YouTube URL");
    }
  }

  return { youtubeVideoId, youtubeVideoIdHi };
}

export async function saveLibraryCourse(formData: FormData) {
  await guardAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const level = String(formData.get("level") ?? "Beginner");
  const tagsRaw = String(formData.get("tags") ?? "");
  const estimatedDurationMin = Number(formData.get("estimatedDurationMin") ?? 0) || 0;
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = formData.get("published") === "true";

  if (!slug || !title || !thumbnailUrl) {
    throw new Error("Title, slug, and thumbnail URL are required");
  }

  const data = {
    slug,
    title,
    description,
    thumbnailUrl,
    level,
    tags: tagsToJson(tagsRaw),
    estimatedDurationMin,
    published,
    order,
  };

  if (id) {
    await db.libraryCourse.update({ where: { id }, data });
  } else {
    await db.libraryCourse.create({ data });
  }
  revalidatePath("/admin/library");
  revalidatePath("/library");
  revalidatePath(`/library/${slug}`);
  redirect("/admin/library");
}

export async function deleteLibraryCourse(id: string) {
  await guardAdmin();
  await db.libraryCourse.delete({ where: { id } });
  revalidatePath("/admin/library");
  revalidatePath("/library");
  redirect("/admin/library");
}

export async function addLibraryVideo(courseId: string, formData: FormData) {
  await guardAdmin();
  const { youtubeVideoId, youtubeVideoIdHi } = parseYoutubeUrls(formData);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl =
    String(formData.get("thumbnailUrl") ?? "").trim() || youtubeThumbnailUrl(youtubeVideoId);
  const duration = String(formData.get("duration") ?? "").trim() || "0:00";
  const publishedAt = String(formData.get("publishedAt") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const tagsRaw = String(formData.get("tags") ?? "");
  const maxOrder = await db.libraryVideo.aggregate({
    where: { courseId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;
  await db.libraryVideo.create({
    data: {
      courseId,
      youtubeVideoId,
      youtubeVideoIdHi,
      title: title || youtubeVideoId,
      description,
      thumbnailUrl,
      duration,
      publishedAt,
      tags: tagsToJson(tagsRaw),
      order,
    },
  });
  revalidatePath(`/admin/library/${courseId}/videos`);
  revalidatePath("/library");
}

export async function updateLibraryVideo(videoId: string, courseId: string, formData: FormData) {
  await guardAdmin();
  const { youtubeVideoId, youtubeVideoIdHi } = parseYoutubeUrls(formData);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim() || "0:00";
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");

  await db.libraryVideo.update({
    where: { id: videoId },
    data: {
      youtubeVideoId,
      youtubeVideoIdHi,
      title,
      description,
      thumbnailUrl: thumbnailUrl || youtubeThumbnailUrl(youtubeVideoId),
      duration,
      publishedAt: publishedAt || undefined,
      tags: tagsToJson(tagsRaw),
    },
  });
  revalidatePath(`/admin/library/${courseId}/videos`);
  revalidatePath("/library");
}

export async function deleteLibraryVideo(videoId: string, courseId: string) {
  await guardAdmin();
  await db.libraryVideo.delete({ where: { id: videoId } });
  revalidatePath(`/admin/library/${courseId}/videos`);
  revalidatePath("/library");
}

export async function moveLibraryVideo(videoId: string, courseId: string, delta: number) {
  await guardAdmin();
  const v = await db.libraryVideo.findUnique({ where: { id: videoId } });
  if (!v) return;
  const swap = await db.libraryVideo.findFirst({
    where: { courseId, order: v.order + delta },
  });
  if (!swap) return;
  await db.$transaction([
    db.libraryVideo.update({ where: { id: v.id }, data: { order: swap.order } }),
    db.libraryVideo.update({ where: { id: swap.id }, data: { order: v.order } }),
  ]);
  revalidatePath(`/admin/library/${courseId}/videos`);
  revalidatePath("/library");
}

export async function addStandaloneVideo(formData: FormData) {
  await guardAdmin();
  const { youtubeVideoId, youtubeVideoIdHi } = parseYoutubeUrls(formData);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl =
    String(formData.get("thumbnailUrl") ?? "").trim() || youtubeThumbnailUrl(youtubeVideoId);
  const duration = String(formData.get("duration") ?? "").trim() || "0:00";
  const publishedAt = String(formData.get("publishedAt") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const tagsRaw = String(formData.get("tags") ?? "");
  const published = formData.get("published") === "true";
  const latest = await db.libraryStandaloneVideo.findMany({ orderBy: { order: "desc" }, take: 1 });
  const order = (latest[0]?.order ?? -1) + 1;

  await db.libraryStandaloneVideo.create({
    data: {
      youtubeVideoId,
      youtubeVideoIdHi,
      title: title || youtubeVideoId,
      description,
      thumbnailUrl,
      duration,
      publishedAt,
      tags: tagsToJson(tagsRaw),
      published,
      order,
    },
  });
  revalidatePath("/admin/library/standalone");
  revalidatePath("/library");
}

export async function updateStandaloneVideo(videoId: string, formData: FormData) {
  await guardAdmin();
  const { youtubeVideoId, youtubeVideoIdHi } = parseYoutubeUrls(formData);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim() || "0:00";
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const published = formData.get("published") === "true";

  await db.libraryStandaloneVideo.update({
    where: { id: videoId },
    data: {
      youtubeVideoId,
      youtubeVideoIdHi,
      title,
      description,
      thumbnailUrl: thumbnailUrl || youtubeThumbnailUrl(youtubeVideoId),
      duration,
      publishedAt: publishedAt || undefined,
      tags: tagsToJson(tagsRaw),
      published,
    },
  });
  revalidatePath("/admin/library/standalone");
  revalidatePath("/library");
}

export async function deleteStandaloneVideo(videoId: string) {
  await guardAdmin();
  await db.libraryStandaloneVideo.delete({ where: { id: videoId } });
  revalidatePath("/admin/library/standalone");
  revalidatePath("/library");
}

export async function moveStandaloneVideo(videoId: string, delta: number) {
  await guardAdmin();
  const v = await db.libraryStandaloneVideo.findUnique({ where: { id: videoId } });
  if (!v) return;
  const swap = await db.libraryStandaloneVideo.findFirst({
    where: { order: v.order + delta },
  });
  if (!swap) return;
  await db.$transaction([
    db.libraryStandaloneVideo.update({ where: { id: v.id }, data: { order: swap.order } }),
    db.libraryStandaloneVideo.update({ where: { id: swap.id }, data: { order: v.order } }),
  ]);
  revalidatePath("/admin/library/standalone");
  revalidatePath("/library");
}
