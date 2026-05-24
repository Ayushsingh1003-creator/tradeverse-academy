import Link from "next/link";
import { getSiteBannerConfig } from "@/lib/siteBanner";
import { saveSiteBannerConfig } from "./actions";

export default async function AdminSiteBannerPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const cfg = await getSiteBannerConfig();
  const saved = searchParams.saved === "1";

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-black">Site banner</h1>
      <p className="mb-6 text-sm text-[#888]">
        Controls the announcement strip above the nav for{" "}
        <Link href="/dashboard" className="text-[#88C9F7] hover:underline">
          all signed-in pages
        </Link>
        . Layout and animations live in{" "}
        <code className="rounded bg-black/40 px-1 text-[#ccc]">src/components/ui/Banner.tsx</code> — this page only
        edits text and visibility.
      </p>

      {saved ? (
        <p className="mb-4 rounded-xl border border-[#456DFF]/30 bg-[#456DFF]/10 px-4 py-2 text-sm text-white">
          Saved. Each user sees it on their next page load (or navigation); anyone who closed the old bar sees this
          version again automatically.
        </p>
      ) : null}

      <form action={saveSiteBannerConfig} className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="enabled" value="true" defaultChecked={cfg.enabled} className="h-4 w-4 rounded" />
          <span className="font-medium text-white">Show banner on dashboard</span>
        </label>

        <div>
          <label htmlFor="message" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#888]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            defaultValue={cfg.message}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#456DFF]/50"
            maxLength={2000}
            required
          />
        </div>

        <div>
          <label htmlFor="variant" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#888]">
            Style
          </label>
          <select
            id="variant"
            name="variant"
            defaultValue={cfg.variant}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#456DFF]/50"
          >
            <option value="rainbow">Rainbow (animated)</option>
            <option value="normal">Normal (solid bar)</option>
          </select>
        </div>

        <div>
          <label htmlFor="bannerId" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#888]">
            Dismiss key (localStorage)
          </label>
          <input
            id="bannerId"
            name="bannerId"
            type="text"
            defaultValue={cfg.bannerId}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#456DFF]/50"
            pattern="[a-zA-Z0-9_-]+"
            title="Letters, numbers, dashes, underscores only"
          />
          <p className="mt-1 text-xs text-[#666]">
            Optional override: closing the banner is remembered per user until you save again (revision bumps) or change
            this key.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-[#456DFF] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2A4AE8]"
        >
          Save banner
        </button>
      </form>
    </div>
  );
}
