"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchVoiceStatus,
  transcribeWithBrowser,
  transcribeWithWhisper,
  VoiceRecorder,
  type VoiceInputStatus,
} from "@/lib/voiceInput";

type Props = {
  aiInput: string;
  aiLoading: boolean;
  aiLoadingLabel?: string;
  voiceOn: boolean;
  onInputChange: (value: string) => void;
  onToggleVoice: () => void;
  onSubmit: () => void | Promise<void>;
  onTranscript: (text: string) => void | Promise<void>;
  className?: string;
};

export function CoachVoiceInput({
  aiInput,
  aiLoading,
  aiLoadingLabel = "Thinking…",
  voiceOn,
  onInputChange,
  onToggleVoice,
  onSubmit,
  onTranscript,
  className = "",
}: Props) {
  const [status, setStatus] = useState<VoiceInputStatus | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const stopBrowserRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void fetchVoiceStatus().then(setStatus);
    return () => stopBrowserRef.current?.();
  }, []);

  const whisperReady = status?.whisper ?? false;
  const piperReady = status?.piper ?? false;
  const voiceLabel = piperReady ? "Piper voice" : voiceOn ? "Browser voice" : "Voice off";

  const handleMicClick = async () => {
    if (aiLoading || transcribing) return;

    if (recording) {
      setRecording(false);
      setTranscribing(true);
      try {
        const rec = recorderRef.current;
        if (!rec) throw new Error("No recorder");
        const blob = await rec.stopAndGetBlob();
        const text = await transcribeWithWhisper(blob);
        await onTranscript(text);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Transcription failed");
      } finally {
        setTranscribing(false);
        recorderRef.current = null;
      }
      return;
    }

    if (whisperReady) {
      try {
        const rec = new VoiceRecorder();
        recorderRef.current = rec;
        await rec.start();
        setRecording(true);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Microphone access denied");
      }
      return;
    }

    stopBrowserRef.current?.();
    setTranscribing(true);
    stopBrowserRef.current = transcribeWithBrowser(
      async (text) => {
        setTranscribing(false);
        await onTranscript(text);
      },
      (msg) => {
        setTranscribing(false);
        alert(msg);
      },
    );
  };

  return (
    <div className={className}>
      <p className="mb-2 text-[10px] text-slate-500">
        {whisperReady ? "🎙 Whisper STT" : "🎙 Browser STT"}
        {" · "}
        {voiceLabel}
        {status && !status.ready ? " · run npm run voice:server" : null}
      </p>
      <div className="flex gap-2">
        <input
          value={aiInput}
          onChange={(e) => onInputChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
          placeholder="Ask or tap mic…"
        />
        <button
          type="button"
          title={recording ? "Stop and send" : "Speak"}
          disabled={aiLoading || transcribing}
          aria-pressed={recording}
          className={`shrink-0 rounded-xl border px-3 py-2 text-lg transition ${
            recording
              ? "animate-pulse border-red-500/60 bg-red-500/20"
              : "border-slate-600 bg-slate-800 hover:border-[#456DFF]/50"
          } disabled:opacity-50`}
          onClick={() => void handleMicClick()}
        >
          {transcribing ? "…" : recording ? "⏹" : "🎤"}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200" onClick={onToggleVoice}>
          {voiceOn ? "🔊 Voice on" : "🔇 Voice off"}
        </button>
        <button
          type="button"
          disabled={aiLoading || transcribing}
          className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
          onClick={() => void onSubmit()}
        >
          {aiLoading ? aiLoadingLabel : "Send"}
        </button>
      </div>
    </div>
  );
}
