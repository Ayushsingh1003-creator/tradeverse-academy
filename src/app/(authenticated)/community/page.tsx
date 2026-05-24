import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-text-muted">
          Activity from people you follow will appear here. Follow traders from their profile, then see lesson completions, level ups, and streak milestones.
        </p>
        <Card>
          <p className="text-sm text-text-muted">Sample feed</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-xl border border-border bg-surface2/50 px-3 py-2">Alex M. completed RSI: Overbought &amp; Oversold · 2h ago · +70 XP</li>
            <li className="rounded-xl border border-border bg-surface2/50 px-3 py-2">Jordan hit a 7-day streak 🔥 · 5h ago</li>
          </ul>
          <p className="mt-4 text-xs text-text-muted">Reactions (👏 💡 🔥) and comments on milestones ship with the follow graph + APIs.</p>
        </Card>
        <Link href="/leaderboard" className="text-accent underline">
          Leaderboard
        </Link>
      </section>
    </main>
  );
}
