"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { signInWithGoogle, TradeverseIdError } from "@/lib/auth/tradeverseIdClient";
import { AUTH_AFTER_SIGN_IN_URL, AUTH_AFTER_SIGN_UP_URL } from "@/lib/auth/urls";

type GoogleSignInButtonProps = {
  variant: "sign-in" | "sign-up";
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleSignInButtonInner {...props} />
    </GoogleOAuthProvider>
  );
}

function GoogleSignInButtonInner({ variant }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const redirectTo = variant === "sign-up" ? AUTH_AFTER_SIGN_UP_URL : AUTH_AFTER_SIGN_IN_URL;

  // Client-side popup (Google Identity Services), same as W1 — Tradeverse ID
  // verifies the resulting token server-side, no redirect-based OAuth flow, no
  // state/PKCE surface to manage.
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      setError(null);
      try {
        await signInWithGoogle(response.access_token);
        router.push(redirectTo);
        router.refresh();
      } catch (e) {
        setError(e instanceof TradeverseIdError ? e.message : "Google sign-in failed. Try again.");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in failed. Try again.");
      setLoading(false);
    },
  });

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          setError(null);
          login();
        }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
