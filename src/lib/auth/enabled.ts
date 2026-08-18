export function isAuthConfigured() {
  const serverConfigured = Boolean(
    process.env.NEON_AUTH_BASE_URL?.trim() && process.env.NEON_AUTH_COOKIE_SECRET?.trim(),
  );
  // Browser bundles cannot read non-NEXT_PUBLIC env vars; treat auth as enabled client-side
  // and let actual session state determine signed-in behavior.
  if (typeof window !== "undefined") return true;
  return serverConfigured;
}
