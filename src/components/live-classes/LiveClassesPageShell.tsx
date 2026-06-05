"use client";

import { AppNav } from "@/components/layout/AppNav";
import { PAGE_SHELL_CLASSES } from "@/components/layout/pageShell";

export function LiveClassesPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#141414]">
      <AppNav />
      <section className={`${PAGE_SHELL_CLASSES} py-8`}>{children}</section>
    </main>
  );
}
