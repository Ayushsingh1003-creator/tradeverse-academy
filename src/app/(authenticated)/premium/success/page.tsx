import Link from "next/link";

export default function PremiumSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl rounded-2xl border border-accent/40 bg-surface p-8 text-center">
        <h1 className="text-3xl font-bold text-accent">Premium Activated</h1>
        <p className="mt-3 text-text-muted">Your upgrade is confirmed. You now have full access to all premium features.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
