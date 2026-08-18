"use server";

import { neonAuth } from "@/lib/auth/server";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import type { AuthFormErrorState, VerificationFormState } from "@/lib/auth/form-state";
import { buildVerificationResumeState, sendVerificationOtpForEmail } from "@/lib/auth/verification-flow";
import { redirect } from "next/navigation";

export async function verifyEmailWithOtp(
  _prev: VerificationFormState | null,
  formData: FormData,
): Promise<VerificationFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").replace(/\D/g, "");
  if (!email || otp.length !== 6) {
    return { needsVerification: true, email, error: "Enter the 6-digit code from your email." };
  }

  const { error } = await neonAuth.emailOtp.verifyEmail({ email, otp });
  if (error) {
    return {
      needsVerification: true,
      email,
      error: error.message || "Invalid or expired code. Try again or resend.",
    };
  }

  // Clear any auto-session from verify so user signs in with password on /sign-in
  await neonAuth.signOut();

  redirect(`${AUTH_SIGN_IN_URL}?verified=1`);
}

export async function resendVerificationOtp(
  _prev: { message?: string; error?: string } | null,
  formData: FormData,
): Promise<{ message?: string; error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Email is required." };
  }

  const { error } = await sendVerificationOtpForEmail(email);

  if (error) {
    return { error: error.message || "Could not resend code. Try again shortly." };
  }

  return { message: "A new code was sent to your email." };
}

/** Start / resume verification when user only has an email (no password). */
export async function resumeVerificationByEmail(
  _prev: VerificationFormState | AuthFormErrorState | null,
  formData: FormData,
): Promise<VerificationFormState | AuthFormErrorState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter your email to receive a verification code." };
  }
  return buildVerificationResumeState(email, "sign-up");
}
