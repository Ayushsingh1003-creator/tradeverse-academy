"use client";

import { signOut as signOutTradeverseId } from "@/lib/auth/tradeverseIdClient";

/** Revokes the shared Tradeverse ID session (auth_sessions row + cookies) so W1
 * also sees the user as logged out on its next check. Client-side only — no server
 * action needed, since this is just a fetch to auth.tradeversejournal.com. */
export async function signOut() {
  try {
    await signOutTradeverseId();
  } catch (error) {
    console.error("Central logout failed (local logout still proceeds):", error);
  }
}
