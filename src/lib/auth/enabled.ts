export function isAuthConfigured() {
  return Boolean(process.env.NEON_AUTH_BASE_URL?.trim() && process.env.NEON_AUTH_COOKIE_SECRET?.trim());
}
