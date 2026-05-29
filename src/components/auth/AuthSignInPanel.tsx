"use client";

import type { ReactNode } from "react";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type AuthSignInPanelProps = {
  variant: "sign-in" | "sign-up";
  children: ReactNode;
  /** Hide Google + divider (e.g. email verification step). */
  showSocial?: boolean;
};

export function AuthSignInPanel({ variant, children, showSocial = true }: AuthSignInPanelProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <AuthFormHeader variant={variant} />
      {showSocial ? (
        <>
      <GoogleSignInButton variant={variant} />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide text-[#666]">or</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </div>
        </>
      ) : null}
      {children}
    </div>
  );
}
