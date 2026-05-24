import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function TeamsLandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <h1 className="text-4xl font-bold">Train your desk on Tradeverse</h1>
        <p className="text-lg text-text-muted">Team dashboards, course assignments, progress exports, and optional branded subdomain.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold">Managers</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-text-muted">
              <li>Seat-based access (min 5)</li>
              <li>Assign paths with due dates</li>
              <li>CSV / PDF export</li>
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Traders</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-text-muted">
              <li>Full Premium curriculum</li>
              <li>Leagues + certificates</li>
              <li>Branded portal on subdomain</li>
            </ul>
          </Card>
        </div>
        <Link href="/teams/onboard" className="inline-block rounded-2xl bg-accent px-8 py-4 font-semibold text-slate-900">
          Start team trial
        </Link>
      </section>
    </main>
  );
}
