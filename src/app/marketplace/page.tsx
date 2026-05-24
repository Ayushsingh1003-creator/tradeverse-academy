import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <h1 className="text-3xl font-bold">Course marketplace</h1>
        <p className="text-text-muted">Filter by category, level, price, rating — cards backed by MarketplaceCourse model.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold">Sample creator course</p>
            <p className="mt-2 text-xs text-text-muted">⭐ 4.8 · 120 students · $19.99</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-2xl border border-border px-3 py-2 text-sm">
                Preview
              </button>
              <Link href="/pricing" className="rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-slate-900">
                Buy
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
