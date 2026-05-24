"use client";

import { isClerkConfigured } from "@/lib/clerkEnabled";
import type { XpEarnReason } from "@/lib/xpEarnPolicy";

export async function syncXpEarn(payload: {
  amount: number;
  reason: XpEarnReason;
  ref?: string;
  idempotencyKey?: string;
  /** Client-local calendar day (YYYY-MM-DD) for streak server sync (`lesson` / `streak` / `daily_challenge`). */
  activityLocalDate?: string;
  /** From `Intl.DateTimeFormat().resolvedOptions().timeZone` for server streak reminders. */
  ianaTimezone?: string;
}) {
  if (!isClerkConfigured()) return;
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
    }
  } catch (e) {
    console.warn("syncXpEarn failed", e);
  }
}
