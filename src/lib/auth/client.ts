"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";
import { getAuthApiBaseUrl } from "@/lib/auth/app-url";

function resolveAuthApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  return getAuthApiBaseUrl();
}

export const authClient = createAuthClient(resolveAuthApiBaseUrl(), {
  adapter: BetterAuthReactAdapter(),
});
