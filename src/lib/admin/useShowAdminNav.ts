"use client";

import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { getClientAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";
import { useUserStore } from "@/lib/store";

/** Client nav: `isAdmin` from `/api/user/me` (DB role) or email allowlist. */
export function useShowAdminNav(): boolean {
  const { user, isLoading } = useAuthSession();
  const dbAdmin = useUserStore((s) => s.isAdmin);
  const email = user?.email;

  if (isLoading) return false;
  if (dbAdmin) return true;
  if (!user) return false;
  return isAdminEmail(email, getClientAdminAllowlist());
}
