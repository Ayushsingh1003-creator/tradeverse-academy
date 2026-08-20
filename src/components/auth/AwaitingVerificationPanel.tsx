"use client";

import { useState } from "react";
import { resendVerificationEmail, TradeverseIdError } from "@/lib/auth/tradeverseIdClient";
import { getVerifiedReturnUrl } from "@/lib/auth/verification-flow";

type AwaitingVerificationPanelProps = {
  email: string;
};

/** Shown after registration instead of an OTP form — Tradeverse ID verifies by
 * emailed link (matching W1), not a 6-digit code. */
export function AwaitingVerificationPanel({ email }: AwaitingVerificationPanelProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(email, getVerifiedReturnUrl());
      setMessage("A new verification email was sent.");
    } catch (e) {
      setError(e instanceof TradeverseIdError ? e.message : "Could not resend. Try again shortly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-[#456DFF]/25 bg-[#456DFF]/10 px-3 py-2.5 text-sm text-[#c8d9ff]">
        We sent a verification link to <span className="font-semibold text-white">{email}</span>. Click it to
        activate your account, then come back here and sign in.
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={sending}
        className="text-center text-xs font-semibold text-[#88C9F7] hover:text-[#456DFF] disabled:opacity-60"
      >
        {sending ? "Sending…" : "Resend verification email"}
      </button>
    </div>
  );
}
