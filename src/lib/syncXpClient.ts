"use client";

import { isAuthConfigured } from "@/lib/auth/enabled";
import type { XpEarnReason } from "@/lib/xpEarnPolicy";

export type SyncXpEarnResult = {
  xp: number;
  level: number;
  streak?: number;
  streakLocalDate?: string | null;
};

export async function syncXpEarn(payload: {
  amount: number;
  reason: XpEarnReason;
  ref?: string;
  idempotencyKey?: string;
  /** Client-local calendar day (YYYY-MM-DD) for streak server sync (`lesson` / `streak` / `daily_challenge`). */
  activityLocalDate?: string;
  /** From `Intl.DateTimeFormat().resolvedOptions().timeZone` for server streak reminders. */
  ianaTimezone?: string;
}): Promise<SyncXpEarnResult | null> {
  if (!isAuthConfigured()) return null;
  const body: Record<string, unknown> = {
    amount: payload.amount,
    reason: payload.reason,
    ref: payload.ref,
    idempotencyKey: payload.idempotencyKey,
  };
  if (payload.activityLocalDate !== undefined) {
    body.activityLocalDate = payload.activityLocalDate;
  }
  if (payload.ianaTimezone !== undefined) {
    body.ianaTimezone = payload.ianaTimezone;
  }
  try {
    const res = await fetch("/api/xp/earn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("syncXpEarn", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      xp?: number;
      level?: number;
      streak?: number;
      streakLocalDate?: string | null;
    };
    if (data.ok && typeof data.xp === "number" && typeof data.level === "number") {
      return {
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        streakLocalDate: data.streakLocalDate,
      };
    }
    return null;
  } catch (e) {
    console.warn("syncXpEarn failed", e);
    return null;
  }
}
