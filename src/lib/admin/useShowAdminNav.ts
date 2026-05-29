"use client";

import { authClient } from "@/lib/auth/client";
import { getClientAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";
import { useUserStore } from "@/lib/store";

/** Client nav: `isAdmin` from `/api/user/me` (DB role) or email allowlist. */
export function useShowAdminNav(): boolean {
  const { data: session, isPending } = authClient.useSession();
  const dbAdmin = useUserStore((s) => s.isAdmin);
  const email = session?.user?.email;

  if (isPending) return false;
  if (dbAdmin) return true;
  if (!session?.user) return false;
  return isAdminEmail(email, getClientAdminAllowlist());
}
