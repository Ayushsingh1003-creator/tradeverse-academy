import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { resolveIsAdmin } from "@/lib/admin/checkAdmin";
import { isAuthConfigured } from "@/lib/auth/enabled";

/**
 * Restricts /admin routes when Neon Auth is configured.
 * Admins: `ADMIN_EMAILS` / built-in emails, or `User.role === 'admin'` in the database.
 */
export async function ensureAdminAccess() {
  if (!isAuthConfigured()) return;

  const session = await getSession();
  const email = session?.user?.email ?? "";
  const authUserId = session?.user?.id ?? null;

  if (!(await resolveIsAdmin(email, authUserId))) {
    redirect("/dashboard");
  }
}
