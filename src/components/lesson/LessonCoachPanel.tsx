"use client";

import { CoachVoiceInput } from "@/components/lesson/CoachVoiceInput";
import { MENTOR_NAME, MENTOR_TAGLINE } from "@/lib/mentorPersona";

export type CoachMessage = { role: "user" | "coach"; text: string };

type CoachPanelProps = {
  aiHistory: CoachMessage[];
  aiLoading: boolean;
  aiLoadingPhase: "thinking" | "voice" | null;
  aiInput: string;
  voiceOn: boolean;
  suggestedChips: string[];
  onChipClick: (text: string) => void;
  onInputChange: (value: string) => void;
  onToggleVoice: () => void;
  onSubmit: () => void;
  onTranscript: (text: string) => void;
};

export function LessonCoachAside({
  aiHistory,
  aiLoading,
  aiLoadingPhase,
  aiInput,
  voiceOn,
  suggestedChips,
  onChipClick,
  onInputChange,
  onToggleVoice,
  onSubmit,
  onTranscript,
}: CoachPanelProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-[#1E1E1E] md:flex">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold">{MENTOR_NAME}</p>
        <p className="mt-0.5 text-xs text-slate-400">{MENTOR_TAGLINE}</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">No direct quiz answers — hints only.</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {aiHistory.map((m, i) => (
          <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "coach" ? "bg-slate-700/80" : "bg-accent/15"}`}>
            {m.text}
          </div>
        ))}
        {aiLoading ? (
          <div className="rounded-xl bg-slate-700/50 px-3 py-2 text-slate-400">
            {aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        {suggestedChips.map((c) => (
          <button
            key={c}
            type="button"
            disabled={aiLoading}
            className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-[#456DFF]/50 hover:bg-[#456DFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onChipClick(c)}
          >
            💡 {c}
          </button>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <CoachVoiceInput
          aiInput={aiInput}
          aiLoading={aiLoading}
          aiLoadingLabel={aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
          voiceOn={voiceOn}
          onInputChange={onInputChange}
          onToggleVoice={onToggleVoice}
          onSubmit={onSubmit}
          onTranscript={onTranscript}
        />
      </div>
    </aside>
  );
}

export function LessonCoachMobile({
  aiOpen,
  onOpenChange,
  aiLoadingPhase,
  aiInput,
  aiLoading,
  voiceOn,
  onInputChange,
  onToggleVoice,
  onSubmit,
  onTranscript,
}: CoachPanelProps & { aiOpen: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <button
        type="button"
        className="fixed bottom-24 right-4 z-[130] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-lg md:hidden"
        onClick={() => onOpenChange(true)}
      >
        💬
      </button>
      {aiOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[170] max-h-[70vh] rounded-t-2xl border border-border bg-[#1E1E1E] p-4 md:hidden">
          <div className="mb-2 flex justify-between">
            <span className="font-semibold">{MENTOR_NAME}</span>
            <button type="button" onClick={() => onOpenChange(false)}>
              ✕
            </button>
          </div>
          <CoachVoiceInput
            aiInput={aiInput}
            aiLoading={aiLoading}
            aiLoadingLabel={aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
            voiceOn={voiceOn}
            onInputChange={onInputChange}
            onToggleVoice={onToggleVoice}
            onSubmit={onSubmit}
            onTranscript={onTranscript}
          />
        </div>
      ) : null}
    </>
  );
}
