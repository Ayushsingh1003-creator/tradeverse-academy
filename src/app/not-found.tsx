import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { AUTH_HOME_URL } from "@/lib/auth/urls";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#141414]">
      <AppNav />
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <p className="text-6xl font-black text-[#456DFF]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-[#999]">
          This page doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={AUTH_HOME_URL}
            className="rounded-2xl bg-[#456DFF] px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-[#2A4AE8]"
          >
            Go to Home
          </Link>
          <Link
            href="/courses"
            className="rounded-2xl border border-[rgba(255,255,255,0.12)] px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-white/[0.06]"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
