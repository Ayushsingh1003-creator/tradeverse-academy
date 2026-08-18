/** Always allowed to access /admin (in addition to `ADMIN_EMAILS` on the server). */
export const BUILT_IN_ADMIN_EMAILS = ["ayush.singh.finance@gmail.com", "shivamkumarpaswan59@gmail.com"] as const;

function normalizeEmailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Middleware + server components: `ADMIN_EMAILS` env plus built-ins. */
export function getServerAdminAllowlist(): string[] {
  const fromEnv = normalizeEmailList(process.env.ADMIN_EMAILS);
  return Array.from(new Set<string>([...BUILT_IN_ADMIN_EMAILS, ...fromEnv]));
}

/**
 * Client nav: built-ins plus optional `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated) so extra
 * admins see the Admin link without exposing server-only `ADMIN_EMAILS`. Access is still
 * enforced by middleware + `ensureAdminAccess`.
 */
export function getClientAdminAllowlist(): string[] {
  const fromPublic = normalizeEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
  return Array.from(new Set<string>([...BUILT_IN_ADMIN_EMAILS, ...fromPublic]));
}

export function isAdminEmail(email: string | null | undefined, allowlist: string[]): boolean {
  const e = (email ?? "").trim().toLowerCase();
  return Boolean(e && allowlist.includes(e));
}
