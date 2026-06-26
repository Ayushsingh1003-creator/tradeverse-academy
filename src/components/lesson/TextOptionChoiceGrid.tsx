"use client";

const OPTIONS = ["Option A", "Option B", "Option C", "Option D"] as const;

type Props = {
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  disabled?: boolean;
  checked?: boolean;
  correctIndex?: number;
};

/** Full-width Option A–D buttons (chart lives in the lesson image above). */
export function TextOptionChoiceGrid({
  selectedIndex,
  onSelect,
  disabled,
  checked = false,
  correctIndex = 1,
}: Props) {
  return (
    <div className="grid gap-3">
      {OPTIONS.map((label, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const correctPick = checked && sel && isCorrect;
        const wrongPick = checked && sel && !isCorrect;
        const revealCorrect = checked && isCorrect && !sel;
        const dim = checked && !isCorrect && !sel;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(i)}
            className={`relative min-h-[52px] rounded-xl border-2 px-5 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] ${
              sel && !checked
                ? "border-[#456DFF] bg-[rgba(69,109,255,0.12)] ring-2 ring-[#456DFF]/30"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
            } ${correctPick ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.18)] text-[#88C9F7]" : ""} ${
              wrongPick ? "animate-wrong-shake border-red-400 bg-red-500/15 text-red-100" : ""
            } ${revealCorrect ? "border-[#456DFF]/60 bg-[rgba(69,109,255,0.12)] text-[#88C9F7]" : ""} ${
              dim ? "opacity-35" : ""
            }`}
          >
            {label}
            {correctPick ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#88C9F7]" aria-hidden>
                ✓
              </span>
            ) : null}
            {wrongPick ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-red-300" aria-hidden>
                ✗
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
