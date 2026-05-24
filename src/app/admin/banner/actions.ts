"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";

export async function saveSiteBannerConfig(formData: FormData) {
  await guardAdmin();
  const enabled = formData.get("enabled") === "true";
  const message = String(formData.get("message") ?? "").slice(0, 2000);
  const variantRaw = String(formData.get("variant") ?? "rainbow").toLowerCase();
  const variant = variantRaw === "normal" ? "normal" : "rainbow";
  const bannerId = String(formData.get("bannerId") ?? "dashboard-top-banner")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 120) || "dashboard-top-banner";

  await db.siteBannerConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      enabled,
      message,
      variant,
      bannerId,
    },
    update: { enabled, message, variant, bannerId },
  });

  revalidateTag("site-banner");
  revalidatePath("/dashboard");
  revalidatePath("/admin/banner");
  redirect("/admin/banner?saved=1");
}
