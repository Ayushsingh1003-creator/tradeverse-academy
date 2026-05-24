import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type SiteBannerVariant = "rainbow" | "normal";

export type SiteBannerPublic = {
  enabled: boolean;
  message: string;
  variant: SiteBannerVariant;
  bannerId: string;
  /** Changes on every admin save (DB `updatedAt`); dismiss uses this so new announcements are not hidden by old closes. */
  revision: string;
};

const FALLBACK: SiteBannerPublic = {
  enabled: true,
  message: "Tradeverse update: Track your streak, XP, and lessons from your dashboard.",
  variant: "rainbow",
  bannerId: "dashboard-top-banner",
  revision: "0",
};

function normalizeVariant(v: string): SiteBannerVariant {
  return v === "normal" ? "normal" : "rainbow";
}

async function fetchSiteBannerConfig(): Promise<SiteBannerPublic> {
  try {
    const row = await db.siteBannerConfig.findUnique({ where: { id: "default" } });
    if (!row) return FALLBACK;
    return {
      enabled: row.enabled,
      message: row.message,
      variant: normalizeVariant(row.variant),
      bannerId: row.bannerId.trim() || FALLBACK.bannerId,
      revision: String(row.updatedAt.getTime()),
    };
  } catch {
    return FALLBACK;
  }
}

export const getSiteBannerConfig = unstable_cache(
  fetchSiteBannerConfig,
  ["site-banner-config"],
  { revalidate: 120, tags: ["site-banner"] },
);
