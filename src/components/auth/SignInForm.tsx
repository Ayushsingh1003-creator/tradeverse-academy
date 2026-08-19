"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSignInPanel } from "@/components/auth/AuthSignInPanel";
import { AuthForm, type AuthFormFields } from "@/components/auth/AuthForm";
import { AwaitingVerificationPanel } from "@/components/auth/AwaitingVerificationPanel";
import { signInWithEmail, TradeverseIdError } from "@/lib/auth/tradeverseIdClient";

type SignInFormProps = {
  emailVerified?: boolean;
};

export function SignInForm({ emailVerified }: SignInFormProps) {
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit({ email, password }: AuthFormFields) {
    try {
      await signInWithEmail(email, password);
    } catch (e) {
      if (e instanceof TradeverseIdError && e.data?.requiresVerification) {
        setPendingVerificationEmail(email);
        return;
      }
      throw e instanceof Error ? e : new Error("Failed to sign in.");
    }

    // Dashboard vs onboarding depends on DB state the browser can't read
    // directly — ask the server, default to onboarding if that fails.
    let destination = "/onboarding";
    try {
      const res = await fetch("/api/auth/post-login-redirect");
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.url === "string") destination = data.url;
      }
    } catch {
      // fall through to the default
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <AuthSignInPanel variant="sign-in" showSocial={!pendingVerificationEmail}>
      {pendingVerificationEmail ? (
        <AwaitingVerificationPanel email={pendingVerificationEmail} />
      ) : (
        <>
          {emailVerified ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Email verified. Sign in with your password to continue.
            </p>
          ) : null}
          <AuthForm variant="sign-in" onSubmit={handleSubmit} />
        </>
      )}
    </AuthSignInPanel>
  );
}
