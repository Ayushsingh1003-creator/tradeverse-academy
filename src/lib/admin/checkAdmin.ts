import { db } from "@/lib/db";
import { getServerAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";

export const ADMIN_ROLE = "admin";

export function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === ADMIN_ROLE;
}

/** Server: allowlisted email or `User.role === 'admin'`. */
export async function resolveIsAdmin(
  email: string | null | undefined,
  authUserId?: string | null,
): Promise<boolean> {
  const allow = getServerAdminAllowlist();
  if (isAdminEmail(email, allow)) return true;

  if (authUserId) {
    const byAuth = await db.user.findUnique({
      where: { authUserId },
      select: { role: true },
    });
    if (byAuth && isAdminRole(byAuth.role)) return true;
  }

  const normalized = (email ?? "").trim().toLowerCase();
  if (normalized) {
    const byEmail = await db.user.findUnique({
      where: { email: normalized },
      select: { role: true },
    });
    if (byEmail && isAdminRole(byEmail.role)) return true;
  }

  return false;
}
