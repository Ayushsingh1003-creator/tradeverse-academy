"use client";

import { AppNav } from "@/components/layout/AppNav";

export function LiveClassesPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#141414]">
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-8">{children}</section>
    </main>
  );
}
