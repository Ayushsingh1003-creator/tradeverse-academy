export function isAuthConfigured() {
  const serverConfigured = Boolean(process.env.JWT_PUBLIC_KEY?.trim());
  // Browser bundles cannot read non-NEXT_PUBLIC env vars; treat auth as enabled client-side
  // and let actual session state determine signed-in behavior.
  if (typeof window !== "undefined") return true;
  return serverConfigured;
}
