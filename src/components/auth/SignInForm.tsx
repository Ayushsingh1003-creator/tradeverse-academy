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
    // directly — ask the server. A 401 here means the login response's Set-Cookie
    // didn't actually reach this app (e.g. viewing it on a different host than the
    // one the cookie is scoped to) — surface that plainly rather than silently
    // navigating to /onboarding, where middleware's own session check would just
    // bounce back to sign-in with no visible explanation.
    const res = await fetch("/api/auth/post-login-redirect");
    if (res.status === 401) {
      throw new Error(
        "Signed in, but this app didn't receive the session cookie. If you're testing locally, make sure you're on the same host the cookie is scoped to.",
      );
    }
    if (!res.ok) {
      throw new Error("Signed in, but couldn't determine where to go next. Try refreshing.");
    }
    const data = await res.json();
    const destination = typeof data?.url === "string" ? data.url : "/onboarding";
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
