"use server";

import { neonAuth } from "@/lib/auth/server";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";
import type { SignInFormState } from "@/lib/auth/form-state";
import { buildVerificationResumeState } from "@/lib/auth/verification-flow";
import { isEmailNotVerifiedError } from "@/lib/auth/verification-errors";
import { redirect } from "next/navigation";

export async function signInWithEmail(
  _prev: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await neonAuth.signIn.email({ email, password });
  if (error) {
    const msg = error.message ?? "";
    if (isEmailNotVerifiedError(msg)) {
      return buildVerificationResumeState(email, "sign-in");
    }
    return { error: msg || "Failed to sign in. Try again." };
  }

  const authUserId = await getAuthUserId();
  if (!authUserId) {
    redirect("/onboarding");
  }
  redirect(await resolvePostAuthUrl(authUserId, await getAuthUserEmail()));
}
