import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CLERK_HOME_URL, CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from "@/lib/clerkUrls";
import "@/styles/clerk-auth.css";

const FEATURES = [
  { icon: "📈", title: "Interactive lessons", desc: "Charts, drills, and real market scenarios" },
  { icon: "🔥", title: "Streaks & XP", desc: "Stay consistent and climb the leaderboard" },
  { icon: "🎓", title: "Live cohorts", desc: "Learn with instructors and peers" },
] as const;

type AuthVariant = "sign-in" | "sign-up";

const COPY: Record<AuthVariant, { headline: string; sub: string; switchLabel: string; switchHref: string; switchCta: string }> = {
  "sign-in": {
    headline: "Welcome back",
    sub: "Pick up where you left off — your streak and progress are waiting.",
    switchLabel: "New here?",
    switchHref: CLERK_SIGN_UP_URL,
    switchCta: "Create free account",
  },
  "sign-up": {
    headline: "Start learning today",
    sub: "Master trading one concept at a time. Free to begin — upgrade when you're ready.",
    switchLabel: "Already have an account?",
    switchHref: CLERK_SIGN_IN_URL,
    switchCta: "Sign in",
  },
};

export function AuthPageShell({
  variant,
  children,
  clerkEnabled,
}: {
  variant: AuthVariant;
  children: ReactNode;
  clerkEnabled: boolean;
}) {
  const copy = COPY[variant];

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#456DFF]/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-[#F7C325]/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
        {/* Brand panel */}
        <section className="flex flex-col justify-between border-b border-white/[0.06] px-6 py-8 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div>
            <Link
              href={CLERK_HOME_URL}
              className="inline-flex items-center gap-3 no-underline transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/app-logo.png"
                alt="Tradeverse Academy"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
              <span className="text-lg font-black tracking-tight text-white">Tradeverse Academy</span>
            </Link>

            <h1 className="mt-10 text-3xl font-black leading-tight tracking-tight md:text-4xl lg:mt-14">
              {copy.headline}
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-[#999]">{copy.sub}</p>

            <ul className="mt-10 hidden flex-col gap-4 lg:flex">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-xl" aria-hidden>
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-[#666]">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-[#555] lg:mt-0">
            <Link href={CLERK_HOME_URL} className="text-[#88C9F7] hover:underline">
              ← Back to courses
            </Link>
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-w-0 flex-1 flex-col justify-center px-6 py-10 lg:px-12 lg:py-12">
          <div className="mx-auto w-full min-w-0 max-w-[420px]">
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <p className="text-sm text-[#666]">{copy.switchLabel}</p>
              <Link
                href={copy.switchHref}
                className="rounded-full border border-[#456DFF]/40 bg-[#456DFF]/10 px-3 py-1.5 text-xs font-semibold text-[#88C9F7] no-underline"
              >
                {copy.switchCta}
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1E1E1E]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-6">
              {clerkEnabled ? (
                <div className="tv-auth-clerk w-full min-w-0">{children}</div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
                  <p className="text-sm font-semibold text-amber-100">Clerk not configured</p>
                  <p className="mt-1 text-xs text-amber-200/80">
                    Add <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to{" "}
                    <code className="rounded bg-black/30 px-1">.env.local</code> to enable sign-in.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 hidden text-center text-sm text-[#666] lg:block">
              {copy.switchLabel}{" "}
              <Link href={copy.switchHref} className="font-semibold text-[#88C9F7] no-underline hover:text-[#456DFF]">
                {copy.switchCta}
              </Link>
            </p>

            <p className="mt-6 text-center text-[10px] leading-relaxed text-[#444]">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
