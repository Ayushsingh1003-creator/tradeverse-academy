"use client";

import { authClient } from "@/lib/auth/client";

/** Clears Better Auth client session cache (nanostore) before server sign-out redirect. */
export async function clearClientAuthSession() {
  try {
    await authClient.signOut();
  } catch {
    /* session may already be cleared */
  }
}
