"use client";

import { useId, useRef } from "react";

type OtpInputProps = {
  name?: string;
  disabled?: boolean;
};

export function OtpInput({ name = "otp", disabled }: OtpInputProps) {
  const baseId = useId();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  function syncHidden() {
    const value = digitRefs.current.map((el) => el?.value ?? "").join("");
    if (hiddenRef.current) hiddenRef.current.value = value;
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const input = digitRefs.current[index];
    if (!input) return;
    input.value = digit;
    syncHidden();
    if (digit && index < 5) digitRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, key: string) {
    const input = digitRefs.current[index];
    if (!input) return;
    if (key === "Backspace" && !input.value && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    pasted.split("").forEach((char, i) => {
      const el = digitRefs.current[i];
      if (el) el.value = char;
    });
    syncHidden();
    const focusIndex = Math.min(pasted.length, 5);
    digitRefs.current[focusIndex]?.focus();
  }

  return (
    <div>
      <input ref={hiddenRef} type="hidden" name={name} required />
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={`${baseId}-${index}`}
            ref={(el) => {
              digitRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of 6`}
            className="h-12 w-full max-w-[52px] rounded-xl border border-white/10 bg-black/30 text-center text-lg font-semibold text-white outline-none focus:border-[#456DFF]/60 disabled:opacity-60"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e.key)}
          />
        ))}
      </div>
    </div>
  );
}
