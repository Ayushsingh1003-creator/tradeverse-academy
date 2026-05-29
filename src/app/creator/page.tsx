import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function CreatorLandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <h1 className="text-4xl font-bold">Teach what you know. Earn while you sleep.</h1>
        <p className="text-lg text-text-muted">70% revenue share to creators · 30% platform. Stripe Connect for payouts.</p>
        <Card>
          <p className="font-semibold">Apply to become a Creator</p>
          <p className="mt-2 text-sm text-text-muted">Submit the form — admins review creator applications in the dashboard.</p>
          <Link href="/creator/studio" className="mt-4 inline-block text-accent underline">
            Creator studio (approved users)
          </Link>
        </Card>
      </section>
    </main>
  );
}
