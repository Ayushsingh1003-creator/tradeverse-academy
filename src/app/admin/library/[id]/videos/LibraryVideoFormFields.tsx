"use client";

import { useMemo, useState } from "react";
import { LEARN_PAGE_OPTIONS } from "@/lib/data/learnPageOptions";
import type { LibraryItemType } from "@/lib/libraryItemType";

const inputClass = "rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm";
const inputClassDark = "rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm";

type Props = {
  variant?: "add" | "edit";
  defaultType?: LibraryItemType;
  defaultLearnSlug?: string | null;
  defaultTitle?: string;
  defaultYoutubeEn?: string;
  defaultYoutubeHi?: string;
  defaultDescription?: string;
  defaultThumbnailUrl?: string;
  defaultDuration?: string;
  defaultPublishedAt?: string;
  defaultTags?: string;
};

export function LibraryVideoFormFields({
  variant = "add",
  defaultType = "video",
  defaultLearnSlug = "",
  defaultTitle = "",
  defaultYoutubeEn = "",
  defaultYoutubeHi = "",
  defaultDescription = "",
  defaultThumbnailUrl = "",
  defaultDuration = "",
  defaultPublishedAt = "",
  defaultTags = "",
}: Props) {
  const [itemType, setItemType] = useState<LibraryItemType>(defaultType);
  const [learnSlug, setLearnSlug] = useState(defaultLearnSlug ?? "");

  const autoTitle = useMemo(() => {
    if (itemType !== "learn") return "";
    return LEARN_PAGE_OPTIONS.find((o) => o.slug === learnSlug)?.title ?? "";
  }, [itemType, learnSlug]);

  const fieldClass = variant === "edit" ? inputClassDark : inputClass;

  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-[#888]">
        Type
        <select
          name="type"
          value={itemType}
          onChange={(e) => setItemType(e.target.value === "learn" ? "learn" : "video")}
          className={fieldClass}
        >
          <option value="video">Video (YouTube)</option>
          <option value="learn">Learn (interactive lesson)</option>
        </select>
      </label>

      {itemType === "learn" ? (
        <>
          <label className="flex flex-col gap-1 text-xs text-[#888]">
            Learn page
            <select
              name="learnSlug"
              required
              value={learnSlug}
              onChange={(e) => setLearnSlug(e.target.value)}
              className={fieldClass}
            >
              <option value="">Select /learn/[slug]…</option>
              {LEARN_PAGE_OPTIONS.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.title} — /learn/{opt.slug}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col justify-end gap-1">
            <span className="text-xs text-[#888]">Title (auto)</span>
            <p className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white">
              {autoTitle || "Select a lesson above"}
            </p>
          </div>
        </>
      ) : (
        <>
          <input
            name="youtubeUrlEn"
            defaultValue={defaultYoutubeEn}
            placeholder="English YouTube URL"
            required
            className={fieldClass}
          />
          <input
            name="youtubeUrlHi"
            defaultValue={defaultYoutubeHi}
            placeholder="Hindi YouTube URL (optional)"
            className={fieldClass}
          />
          <input
            name="title"
            defaultValue={defaultTitle}
            placeholder="Title"
            className={fieldClass}
          />
        </>
      )}

      <input
        name="description"
        defaultValue={defaultDescription}
        placeholder="Description"
        className={`md:col-span-2 ${fieldClass}`}
      />
      <input
        name="thumbnailUrl"
        defaultValue={defaultThumbnailUrl}
        placeholder="Thumbnail URL (optional)"
        className={fieldClass}
      />
      <input
        name="duration"
        defaultValue={defaultDuration}
        placeholder={itemType === "learn" ? "Duration label (optional)" : "Duration e.g. 14:20"}
        className={fieldClass}
      />
      <input
        name="publishedAt"
        defaultValue={defaultPublishedAt}
        placeholder="Published date YYYY-MM-DD"
        className={fieldClass}
      />
      <input
        name="tags"
        defaultValue={defaultTags}
        placeholder="Tags, comma-separated"
        className={fieldClass}
      />
    </>
  );
}
