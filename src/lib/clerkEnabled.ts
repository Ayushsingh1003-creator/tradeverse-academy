export function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (!key) return false;
  if (key.includes("REPLACE_ME")) return false;
  if (!/^pk_(test|live)_[A-Za-z0-9_]+$/.test(key)) return false;
  return true;
}
