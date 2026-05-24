import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function LiveSessionDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Session {params.id}</h1>
        <Card>
          <p className="text-text-muted">Countdown, join link (10 min before start), and pre-session chat will load from `LiveSession` + attendees.</p>
        </Card>
      </section>
    </main>
  );
}
