"use client";

import { useFormState, useFormStatus } from "react-dom";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { SignInFormState } from "@/lib/auth/form-state";

type AuthFormProps = {
  action: (prev: SignInFormState, formData: FormData) => Promise<SignInFormState>;
  variant: "sign-in" | "sign-up";
  /** Parent-owned form state (e.g. SignInForm handles verification branch). */
  formAction?: (payload: FormData) => void;
  errorMessage?: string | null;
};

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#456DFF]/60";

function SubmitButton({ variant }: { variant: "sign-in" | "sign-up" }) {
  const { pending } = useFormStatus();
  const isSignUp = variant === "sign-up";
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-[#456DFF] py-2.5 text-sm font-bold text-white transition hover:bg-[#5a7fff] disabled:opacity-60"
    >
      {pending
        ? isSignUp
          ? "Creating account…"
          : "Signing in…"
        : isSignUp
          ? "Create account"
          : "Sign in"}
    </button>
  );
}

export function AuthForm({ action, variant, formAction: controlledAction, errorMessage }: AuthFormProps) {
  const [internalState, internalAction] = useFormState(action, null);
  const formAction = controlledAction ?? internalAction;
  const error = errorMessage ?? internalState?.error;
  const isSignUp = variant === "sign-up";

  return (
    <form action={formAction} className="flex w-full min-w-0 flex-col gap-4">
        {isSignUp ? (
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
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#ccc]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
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
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={isSignUp ? 8 : undefined}
            placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <SubmitButton variant={variant} />
    </form>
  );
}
