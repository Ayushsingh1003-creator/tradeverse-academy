import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getServerAdminAllowlist } from "@/lib/admin/adminAllowlist";
import { isClerkConfigured } from "@/lib/clerkEnabled";

/**
 * Restricts /admin routes when Clerk is configured.
 * Set `ADMIN_EMAILS` to a comma-separated list (e.g. `you@domain.com,other@domain.com`).
 * Built-in allowlist entries apply in addition to `ADMIN_EMAILS`.
 * Without Clerk, admin is open for local development.
 */
export async function ensureAdminAccess() {
  if (!isClerkConfigured()) return;

  const allow = getServerAdminAllowlist();
  if (allow.length === 0) {
    redirect("/dashboard");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  if (!email || !allow.includes(email)) {
    redirect("/dashboard");
  }
}
