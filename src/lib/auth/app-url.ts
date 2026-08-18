/** Public site URL (no trailing slash). Used for redirects, Stripe, and auth. */
export function getPublicAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

/** Better Auth client base path on this Next app. */
export function getAuthApiBaseUrl(): string {
  return `${getPublicAppUrl()}/api/auth`;
}
