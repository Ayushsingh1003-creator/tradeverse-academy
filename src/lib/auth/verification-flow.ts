import { neonAuth } from "@/lib/auth/server";
import type { VerificationFormState } from "@/lib/auth/form-state";

export async function sendVerificationOtpForEmail(email: string) {
  return neonAuth.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });
}

/** Resume OTP verification for an existing unverified account. */
export async function buildVerificationResumeState(
  email: string,
  context: "sign-up" | "sign-in",
): Promise<VerificationFormState> {
  const { error } = await sendVerificationOtpForEmail(email);

  const contextMessage =
    context === "sign-up"
      ? "This email is already registered but not verified yet. We sent a new 6-digit code — enter it below to finish setting up your account."
      : "Your email isn't verified yet. We sent a new 6-digit code — enter it below to verify and continue.";

  if (error) {
    return {
      needsVerification: true,
      email,
      message: contextMessage,
      error:
        error.message ||
        "Could not send a new code. Wait a minute and use Resend code, or try again later.",
    };
  }

  return {
    needsVerification: true,
    email,
    message: contextMessage,
  };
}
