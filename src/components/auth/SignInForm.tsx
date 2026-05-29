"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { AuthSignInPanel } from "@/components/auth/AuthSignInPanel";
import { AuthForm } from "@/components/auth/AuthForm";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import { isVerificationState } from "@/lib/auth/form-state";
import { signInWithEmail } from "@/app/sign-in/[[...sign-in]]/actions";
import type { SignInFormState } from "@/lib/auth/form-state";

type SignInFormProps = {
  initialState?: SignInFormState;
  emailVerified?: boolean;
};

export function SignInForm({ initialState = null, emailVerified }: SignInFormProps) {
  const [state, formAction] = useFormState(signInWithEmail, initialState);
  const needsVerification = isVerificationState(state);

  return (
    <AuthSignInPanel variant="sign-in" showSocial={!needsVerification}>
      {needsVerification && state && "email" in state ? (
        <EmailVerificationForm email={state.email} initialMessage={state.message} />
      ) : (
        <>
          {emailVerified ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Email verified. Sign in with your password to continue.
            </p>
          ) : null}
          <AuthForm
            action={signInWithEmail}
            variant="sign-in"
            formAction={formAction}
            errorMessage={state && "error" in state ? state.error : null}
          />
          <p className="text-center text-xs text-[#666]">
            Stuck without verifying?{" "}
            <Link href="/sign-up?verify=1" className="font-semibold text-[#88C9F7] hover:text-[#456DFF]">
              Get a new code
            </Link>
          </p>
        </>
      )}
    </AuthSignInPanel>
  );
}
