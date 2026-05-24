"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";

function tagsToJson(raw: string): string {
  const parts = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(parts);
}

export async function saveLiveCohort(formData: FormData) {
  await guardAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const instructorName = String(formData.get("instructorName") ?? "").trim();
  const instructorBio = String(formData.get("instructorBio") ?? "").trim();
  const instructorAvatarUrl = String(formData.get("instructorAvatarUrl") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "").trim();
  const durationWeeks = Number(formData.get("durationWeeks") ?? 1) || 1;
  const schedule = String(formData.get("schedule") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const priceAmount = Number(formData.get("priceAmount") ?? 0) || 0;
  const currency = String(formData.get("currency") ?? "INR");
  const stripePriceId = String(formData.get("stripePriceId") ?? "").trim() || null;
  const sampleYoutubeVideoId = String(formData.get("sampleYoutubeVideoId") ?? "").trim();
  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim();
  const curriculumJson = String(formData.get("curriculumJson") ?? "[]");
  const seats = Number(formData.get("seats") ?? 100) || 100;
  let seatsLeft = Number(formData.get("seatsLeft") ?? seats) || seats;
  if (seatsLeft > seats) seatsLeft = seats;
  const level = String(formData.get("level") ?? "Beginner");
  const tags = tagsToJson(String(formData.get("tags") ?? ""));
  const status = String(formData.get("status") ?? "draft");
  const recordingUrl = String(formData.get("recordingUrl") ?? "").trim() || null;

  const data = {
    slug,
    title,
    subtitle,
    description,
    instructorName,
    instructorBio,
    instructorAvatarUrl,
    startDate,
    durationWeeks,
    schedule,
    priceLabel,
    priceAmount,
    currency,
    stripePriceId,
    sampleYoutubeVideoId,
    heroImageUrl,
    curriculumJson,
    seats,
    seatsLeft,
    level,
    tags,
    status,
    recordingUrl,
  };

  if (id) {
    await db.liveCohort.update({ where: { id }, data });
  } else {
    await db.liveCohort.create({ data });
  }
  revalidatePath("/admin/live-cohort");
  revalidatePath("/live-classes");
  revalidatePath(`/live-classes/${slug}`);
  redirect("/admin/live-cohort");
}

export async function deleteLiveCohort(id: string) {
  await guardAdmin();
  const cohort = await db.liveCohort.findUnique({ where: { id }, select: { slug: true } });
  await db.liveCohort.delete({ where: { id } });
  revalidatePath("/admin/live-cohort");
  revalidatePath("/live-classes");
  if (cohort?.slug) revalidatePath(`/live-classes/${cohort.slug}`);
  redirect("/admin/live-cohort");
}

export async function setEnrollmentAttended(enrollmentId: string, cohortId: string, attended: boolean) {
  await guardAdmin();
  await db.liveCohortEnrollment.update({
    where: { id: enrollmentId },
    data: { attended },
  });
  revalidatePath(`/admin/live-cohort/${cohortId}/enrollments`);
  revalidatePath("/admin/live-cohort");
}

export async function setEnrollmentPaid(enrollmentId: string, cohortId: string, paid: boolean) {
  await guardAdmin();
  await db.liveCohortEnrollment.update({
    where: { id: enrollmentId },
    data: { paid },
  });
  revalidatePath(`/admin/live-cohort/${cohortId}/enrollments`);
}

export async function removeEnrollment(enrollmentId: string, cohortId: string) {
  await guardAdmin();
  const enrollment = await db.liveCohortEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { cohortId: true },
  });
  if (!enrollment) return;
  await db.liveCohortEnrollment.delete({ where: { id: enrollmentId } });
  const count = await db.liveCohortEnrollment.count({ where: { cohortId: enrollment.cohortId } });
  const cohort = await db.liveCohort.findUnique({
    where: { id: enrollment.cohortId },
    select: { seats: true },
  });
  if (cohort) {
    const seatsLeft = Math.max(0, cohort.seats - count);
    await db.liveCohort.update({
      where: { id: enrollment.cohortId },
      data: { seatsLeft },
    });
  }
  revalidatePath(`/admin/live-cohort/${cohortId}/enrollments`);
  revalidatePath("/admin/live-cohort");
}
