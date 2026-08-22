"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, MessageCircle, X } from "lucide-react";
import { CoachVoiceInput } from "@/components/lesson/CoachVoiceInput";
import { MENTOR_NAME, MENTOR_TAGLINE } from "@/lib/mentorPersona";

/** Keeps a scrollable message list pinned to its latest entry as new messages arrive. */
function useAutoScrollToBottom<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export type CoachMessage = {
  role: "user" | "coach";
  text: string;
  /** Visual-only label (e.g. "Section - 3") shown above the bubble — never passed to TTS. */
  sectionLabel?: string;
};

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
  const scrollRef = useAutoScrollToBottom<HTMLDivElement>([aiHistory.length, aiLoading]);
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-[#1E1E1E] md:flex">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold">{MENTOR_NAME}</p>
        <p className="mt-0.5 text-xs text-slate-400">{MENTOR_TAGLINE}</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">No direct quiz answers — hints only.</p>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {aiHistory.map((m, i) => (
          <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "coach" ? "bg-slate-700/80" : "bg-accent/15"}`}>
            {m.sectionLabel ? (
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.sectionLabel}</div>
            ) : null}
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
            className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-[#456DFF]/50 hover:bg-[#456DFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onChipClick(c)}
          >
            <Lightbulb size={12} className="shrink-0" />
            {c}
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

/**
 * Left-docked coach panel for pages with no flex-row layout to slot LessonCoachAside
 * into (the bespoke candlestick-essentials lessons). Overlays on top of the page
 * rather than reflowing it, and can collapse to a slim handle on the left edge.
 */
export function LessonCoachDock({
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
  collapsed,
  onToggleCollapsed,
}: CoachPanelProps & { collapsed: boolean; onToggleCollapsed: () => void }) {
  const scrollRef = useAutoScrollToBottom<HTMLDivElement>([aiHistory.length, aiLoading]);
  return (
    <>
      {!collapsed ? (
        <div
          className="fixed inset-0 z-[135] bg-black/40 md:hidden"
          onClick={onToggleCollapsed}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed left-0 top-[68px] bottom-[76px] z-[140] flex w-[min(300px,85vw)] flex-col rounded-r-2xl border border-l-0 border-border bg-[#1E1E1E] shadow-2xl transition-transform duration-300 ease-out ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{MENTOR_NAME}</p>
            <p className="mt-0.5 text-xs leading-snug text-slate-400">{MENTOR_TAGLINE}</p>
          </div>
          <button
            type="button"
            aria-label="Collapse coach panel"
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <p className="px-4 pt-2 text-[11px] leading-snug text-slate-500">No direct quiz answers — hints only.</p>
        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
          {aiHistory.map((m, i) => (
            <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "coach" ? "bg-slate-700/80" : "bg-accent/15"}`}>
              {m.sectionLabel ? (
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.sectionLabel}</div>
              ) : null}
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
              className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-[#456DFF]/50 hover:bg-[#456DFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onChipClick(c)}
            >
              <Lightbulb size={12} className="shrink-0" />
              {c}
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

      {collapsed ? (
        <div className="pointer-events-none fixed left-0 top-[68px] bottom-[76px] z-[140] flex items-center">
          <button
            type="button"
            aria-label={`Open ${MENTOR_NAME}`}
            onClick={onToggleCollapsed}
            className="pointer-events-auto flex h-14 w-9 items-center justify-center rounded-r-xl border border-l-0 border-border bg-[#1E1E1E] text-slate-300 shadow-lg transition hover:bg-[#262626] hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </>
  );
}

export function LessonCoachMobile({
  aiOpen,
  onOpenChange,
  aiHistory,
  aiLoadingPhase,
  aiInput,
  aiLoading,
  voiceOn,
  suggestedChips,
  onChipClick,
  onInputChange,
  onToggleVoice,
  onSubmit,
  onTranscript,
  alwaysShowFab = false,
}: CoachPanelProps & {
  aiOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Show the floating action button on every viewport size, not just mobile (for pages with no docked LessonCoachAside). */
  alwaysShowFab?: boolean;
}) {
  const scrollRef = useAutoScrollToBottom<HTMLDivElement>([aiHistory.length, aiLoading]);
  return (
    <>
      <button
        type="button"
        aria-label={`Ask ${MENTOR_NAME}`}
        className={`fixed bottom-24 right-4 z-[130] flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg ${
          alwaysShowFab ? "" : "md:hidden"
        }`}
        onClick={() => onOpenChange(true)}
      >
        <MessageCircle size={26} />
      </button>
      {aiOpen ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-[170] max-h-[70vh] overflow-y-auto rounded-t-2xl border border-border bg-[#1E1E1E] p-4 ${
            alwaysShowFab ? "" : "md:hidden"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">{MENTOR_NAME}</span>
            <button type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
              <X size={20} />
            </button>
          </div>
          {aiHistory.length > 0 ? (
            <div ref={scrollRef} className="mb-2 max-h-[35vh] space-y-2 overflow-y-auto text-sm">
              {aiHistory.map((m, i) => (
                <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "coach" ? "bg-slate-700/80" : "bg-accent/15"}`}>
                  {m.sectionLabel ? (
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.sectionLabel}</div>
                  ) : null}
                  {m.text}
                </div>
              ))}
              {aiLoading ? (
                <div className="rounded-xl bg-slate-700/50 px-3 py-2 text-slate-400">
                  {aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
                </div>
              ) : null}
            </div>
          ) : null}
          {suggestedChips.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestedChips.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-[#456DFF]/50 hover:bg-[#456DFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onChipClick(c)}
                >
                  <Lightbulb size={12} className="shrink-0" />
                  {c}
                </button>
              ))}
            </div>
          ) : null}
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
