"use client";

const ENTRY = {
  date: "Mon, 14 Apr 2025",
  symbol: "RELIANCE",
  setup: "Pullback into 20-EMA on daily, bullish hammer",
  side: "Long",
  entry: "₹1,250",
  sl: "₹1,240",
  target: "₹1,280",
  size: "100 shares",
  outcome: "Target hit at ₹1,278",
  pnl: "+₹2,800",
  emotion: "Tempted to exit early at +1.5R; held to plan.",
  lesson: "Trust the plan — early exits cap winners.",
};

export function JournalDemo() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-bold text-white">📓 Trade Journal Entry</p>
          <span className="text-xs text-text-muted">{ENTRY.date}</span>
        </div>
        <div className="grid gap-y-2 text-sm sm:grid-cols-2">
          <Item label="Symbol" value={ENTRY.symbol} />
          <Item label="Side" value={ENTRY.side} />
          <Item label="Setup" value={ENTRY.setup} />
          <Item label="Size" value={ENTRY.size} />
          <Item label="Entry" value={ENTRY.entry} />
          <Item label="Stop Loss" value={ENTRY.sl} />
          <Item label="Target" value={ENTRY.target} />
          <Item label="Outcome" value={ENTRY.outcome} />
          <Item label="P&L" value={ENTRY.pnl} accent />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-surface2 p-3 text-xs">
          <p className="text-text-muted">Emotion / Process</p>
          <p className="mt-1 text-white">{ENTRY.emotion}</p>
        </div>
        <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs">
          <p className="text-accent">Lesson learned</p>
          <p className="mt-1 text-white">{ENTRY.lesson}</p>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 pb-1 last:border-none">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-accent" : "text-white"}`}>{value}</span>
    </div>
  );
}
