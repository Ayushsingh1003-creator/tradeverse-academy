"use client";

import { Info } from "lucide-react";
import type { LibraryVideoLang } from "@/lib/libraryVideoLanguage";

export function LibraryVideoLanguageBar({
  lang,
  onLangChange,
  hindiAvailable,
}: {
  lang: LibraryVideoLang;
  onLangChange: (lang: LibraryVideoLang) => void;
  hindiAvailable: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-text-muted">Language</span>
      <div className="inline-flex overflow-hidden rounded-lg border border-border">
        <button
          type="button"
          onClick={() => onLangChange("en")}
          className={`px-3 py-1.5 text-xs font-semibold transition ${
            lang === "en" ? "bg-[#456DFF] text-white" : "bg-surface2 text-text-muted hover:text-white"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => hindiAvailable && onLangChange("hi")}
          disabled={!hindiAvailable}
          className={`px-3 py-1.5 text-xs font-semibold transition ${
            lang === "hi" && hindiAvailable
              ? "bg-[#456DFF] text-white"
              : "bg-surface2 text-text-muted hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          Hindi
        </button>
      </div>
      {!hindiAvailable ? (
        <span
          className="inline-flex items-center gap-1 text-xs text-text-muted"
          title="Hindi version is not available for this video"
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="sr-only">Hindi not available</span>
        </span>
      ) : null}
    </div>
  );
}
