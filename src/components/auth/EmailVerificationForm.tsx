"use client";

import { useFormState, useFormStatus } from "react-dom";
import { OtpInput } from "@/components/auth/OtpInput";
import { resendVerificationOtp, verifyEmailWithOtp } from "@/app/auth/verification/actions";

type EmailVerificationFormProps = {
  email: string;
  initialMessage?: string;
};

function VerifySubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-[#456DFF] py-2.5 text-sm font-bold text-white transition hover:bg-[#5a7fff] disabled:opacity-60"
    >
      {pending ? "Verifying…" : "Verify email"}
    </button>
  );
}

export function EmailVerificationForm({ email, initialMessage }: EmailVerificationFormProps) {
  const [state, formAction] = useFormState(verifyEmailWithOtp, null);

  const error = state && "error" in state ? state.error : undefined;
  const message = state && "message" in state ? state.message : initialMessage;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-[#456DFF]/25 bg-[#456DFF]/10 px-3 py-2.5 text-sm text-[#c8d9ff]">
        We sent a 6-digit code to <span className="font-semibold text-white">{email}</span>. Enter it below to
        verify your account.
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#ccc]">Verification code</label>
          <OtpInput />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <VerifySubmitButton />
      </form>

      <ResendOtpButton email={email} />
    </div>
  );
}

function ResendOtpButton({ email }: { email: string }) {
  const [state, formAction] = useFormState(resendVerificationOtp, null);

  return (
    <form action={formAction} className="text-center">
      <input type="hidden" name="email" value={email} />
      <p className="text-xs text-[#666]">
        Didn&apos;t get the code?{" "}
        <ResendButtonLabel message={state?.message} error={state?.error} />
      </p>
    </form>
  );
}

function ResendButtonLabel({ message, error }: { message?: string; error?: string }) {
  const { pending } = useFormStatus();
  return (
    <span className="inline">
      <button
        type="submit"
        disabled={pending}
        className="font-semibold text-[#88C9F7] hover:text-[#456DFF] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend code"}
      </button>
      {message ? <span className="mt-1 block text-emerald-300/90">{message}</span> : null}
      {error ? <span className="mt-1 block text-red-300/90">{error}</span> : null}
    </span>
  );
}
