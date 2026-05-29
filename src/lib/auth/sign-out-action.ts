"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/server";
import { AUTH_AFTER_SIGN_OUT_URL } from "@/lib/auth/urls";

/** Server sign-out avoids client-origin issues with Neon Auth trusted domains. */
export async function signOutAction() {
  await neonAuth.signOut();
  redirect(AUTH_AFTER_SIGN_OUT_URL);
}
