"use client";

import { useState } from "react";
import { AuthSignInPanel } from "@/components/auth/AuthSignInPanel";
import { AuthForm, type AuthFormFields } from "@/components/auth/AuthForm";
import { AwaitingVerificationPanel } from "@/components/auth/AwaitingVerificationPanel";
import { signUpWithEmail, TradeverseIdError } from "@/lib/auth/tradeverseIdClient";
import { getVerifiedReturnUrl } from "@/lib/auth/verification-flow";

type SignUpFormProps = {
  defaultEmail?: string;
};

export function SignUpForm({ defaultEmail }: SignUpFormProps) {
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  async function handleSubmit({ name, email, password }: AuthFormFields) {
    try {
      await signUpWithEmail(email, password, name ?? "", getVerifiedReturnUrl());
      setPendingVerificationEmail(email);
    } catch (e) {
      if (e instanceof TradeverseIdError && /already exists/i.test(e.message)) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      }
      throw e instanceof Error ? e : new Error("Failed to create account.");
    }
  }

  return (
    <AuthSignInPanel variant="sign-up" showSocial={!pendingVerificationEmail}>
      {pendingVerificationEmail ? (
        <AwaitingVerificationPanel email={pendingVerificationEmail} />
      ) : (
        <AuthForm variant="sign-up" onSubmit={handleSubmit} defaultEmail={defaultEmail} />
      )}
    </AuthSignInPanel>
  );
}
