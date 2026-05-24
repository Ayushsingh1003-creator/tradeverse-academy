"use server";

import { ensureAdminAccess } from "@/lib/admin/ensureAdmin";

/** Call at the start of every admin server action. Redirects non-admins. */
export async function guardAdmin() {
  await ensureAdminAccess();
}
