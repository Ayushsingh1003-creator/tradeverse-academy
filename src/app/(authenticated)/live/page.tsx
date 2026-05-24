import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function LiveSessionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">Live sessions</h1>
        <p className="text-text-muted">Upcoming instructor-led analysis. Premium: unlimited; Free: 1 session/month (enforce via subscription check).</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-xs uppercase tracking-wide text-accent">Upcoming</p>
            <h2 className="mt-2 text-xl font-semibold">Live: NFP prep &amp; volatility plan</h2>
            <p className="mt-2 text-sm text-text-muted">Scheduled · instructor TBA · Register from detail page once sessions are seeded in Prisma.</p>
            <Link href="/live/demo-session" className="mt-4 inline-block text-sm text-accent underline">
              View detail
            </Link>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-text-muted">Replay</p>
            <h2 className="mt-2 text-xl font-semibold">Chart walkthrough: trend + structure</h2>
            <p className="mt-2 text-sm text-text-muted">Recording URL will appear here after the session ends.</p>
          </Card>
        </div>
      </section>
    </main>
  );
}
