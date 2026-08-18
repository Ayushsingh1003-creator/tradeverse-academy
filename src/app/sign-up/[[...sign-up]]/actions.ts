"use server";

import { neonAuth } from "@/lib/auth/server";
import { AUTH_AFTER_SIGN_UP_URL } from "@/lib/auth/urls";
import type { SignUpFormState } from "@/lib/auth/form-state";
import { buildVerificationResumeState } from "@/lib/auth/verification-flow";
import { isEmailNotVerifiedError, isUserAlreadyExistsError } from "@/lib/auth/verification-errors";
import { redirect } from "next/navigation";

function needsEmailVerification(data: { user?: { emailVerified?: boolean }; token?: string | null } | null) {
  if (!data?.user) return false;
  if (data.user.emailVerified) return false;
  return !data.token;
}

export async function signUpWithEmail(
  _prev: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !name) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { data, error } = await neonAuth.signUp.email({ email, password, name });
  if (error) {
    const msg = error.message ?? "";
    if (isUserAlreadyExistsError(msg)) {
      const signInAttempt = await neonAuth.signIn.email({ email, password });
      if (!signInAttempt.error) {
        await neonAuth.signOut();
        return {
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
      if (isEmailNotVerifiedError(signInAttempt.error.message ?? "")) {
        return buildVerificationResumeState(email, "sign-up");
      }
      return {
        error: "An account with this email already exists. Please sign in instead.",
      };
    }
    return { error: msg || "Failed to create account." };
  }

  if (needsEmailVerification(data)) {
    return {
      needsVerification: true,
      email,
      message: "Check your inbox for the 6-digit verification code.",
    };
  }

  redirect(AUTH_AFTER_SIGN_UP_URL);
}
