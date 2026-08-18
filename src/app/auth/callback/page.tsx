"use client";

import { AuthCallback } from "@neondatabase/auth/react";

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
      <div className="text-center">
        <AuthCallback />
        <p className="mt-4 text-sm text-[#888]">Completing sign in…</p>
      </div>
    </main>
  );
}
