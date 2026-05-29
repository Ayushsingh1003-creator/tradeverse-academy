"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AuthSignInPanel } from "@/components/auth/AuthSignInPanel";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { signUpWithEmail } from "@/app/sign-up/[[...sign-up]]/actions";
import { isVerificationState, type SignUpFormState } from "@/lib/auth/form-state";

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#456DFF]/60";

function CreateAccountButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-[#456DFF] py-2.5 text-sm font-bold text-white transition hover:bg-[#5a7fff] disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

type SignUpFormProps = {
  initialState?: SignUpFormState;
  defaultEmail?: string;
};

export function SignUpForm({ initialState = null, defaultEmail }: SignUpFormProps) {
  const [signUpState, signUpAction] = useFormState(signUpWithEmail, initialState);
  const verificationState = isVerificationState(signUpState) ? signUpState : null;

  const signUpError =
    signUpState && "error" in signUpState && !verificationState ? signUpState.error : undefined;

  return (
    <AuthSignInPanel variant="sign-up" showSocial={!verificationState}>
      {verificationState ? (
        <EmailVerificationForm email={verificationState.email} initialMessage={verificationState.message} />
      ) : (
        <form action={signUpAction} className="flex w-full min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[#ccc]">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={fieldClassName}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#ccc]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClassName}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#ccc]">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>

          {signUpError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {signUpError}
            </p>
          ) : null}

          <CreateAccountButton />
        </form>
      )}
    </AuthSignInPanel>
  );
}
