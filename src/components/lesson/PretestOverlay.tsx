"use client";

import { Button } from "@/components/ui/Button";

export function PretestOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6">
      <div className="max-w-xl rounded-xl border border-border bg-surface p-6">
        <p className="text-sm uppercase text-accent">Before we explain</p>
        <h3 className="mt-2 text-xl font-bold">What do you think this candlestick means?</h3>
        <p className="mt-2 text-text-muted">Take a shot. We care about your reasoning more than being right.</p>
        <Button onClick={onDismiss} className="mt-4">
          Start Lesson
        </Button>
      </div>
    </div>
  );
}
