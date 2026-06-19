import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/lib/data/lessons";
import { COURSES } from "@/lib/data/courses";
import { db } from "@/lib/db";
import { collectLessonImageSlots, DEFAULT_LESSON_IMAGE_ADMIN_CONFIG, recordToLessonImageAdminConfig } from "@/lib/lessonImageOverrides";
import { fetchLessonImageRecords } from "@/lib/lessonImageOverrides.server";
import { LESSON_FALLBACK_SRC, lessonImageAlignClass } from "@/lib/lessonImages";
import { removeLessonImageUrl, removeLessonVideo, saveLessonImageSettings, saveLessonVideo } from "../actions";

export default async function AdminLessonEditorPage({ params }: { params: { id: string } }) {
  const lesson = LESSONS.find((item) => item.id === params.id);
  if (!lesson) notFound();

  const course = COURSES.find((c) => c.id === lesson.courseId);
  const video = await db.lessonVideo.findUnique({ where: { lessonSlug: lesson.slug } });
  const imageOverrides = await fetchLessonImageRecords(lesson.slug);
  const overrideByPageId = new Map(imageOverrides.map((row) => [row.pageId, row]));
  const imageSlots = collectLessonImageSlots(lesson);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/lessons" className="text-sm text-[#666] hover:text-white">
        ← Lessons
      </Link>

      <div>
        <h1 className="text-2xl font-black">{lesson.title}</h1>
        <p className="mt-1 text-sm text-[#666]">
          {course?.title ?? "Unknown course"} · <span className="font-mono">{lesson.slug}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6 text-sm text-[#ccc]">
        <h2 className="mb-2 font-bold text-white">Lesson content (code)</h2>
        <p>
          Page flow, questions, and visuals are defined in TypeScript under{" "}
          <code className="text-[#88C9F7]">src/lib/data/lessons/</code>. Search for slug{" "}
          <code className="rounded bg-black/40 px-1">{lesson.slug}</code> to edit copy and blocks.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/learn/${lesson.slug}`}
            className="rounded-xl bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white"
          >
            Preview lesson
          </Link>
          <span className="rounded-xl border border-white/10 px-4 py-2 text-xs text-[#666]">
            {lesson.pages.length} pages · {lesson.isFree ? "Free" : "Premium"} · {lesson.xpReward} XP
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <h2 className="mb-4 font-bold">Mux intro video</h2>
        <p className="mb-4 text-xs text-[#666]">
          Optional video shown at the start of the lesson player when a Mux playback ID is configured.
        </p>
        <form action={saveLessonVideo} className="space-y-3">
          <input type="hidden" name="lessonSlug" value={lesson.slug} />
          <label className="block text-xs text-[#999]">
            Mux asset ID
            <input
              name="muxAssetId"
              defaultValue={video?.muxAssetId ?? ""}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#999]">
            Mux playback ID
            <input
              name="muxPlaybackId"
              defaultValue={video?.muxPlaybackId ?? ""}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#999]">
            Duration (seconds)
            <input
              name="duration"
              type="number"
              defaultValue={video?.duration ?? 0}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#999]">
            Thumbnail URL (optional)
            <input
              name="thumbnail"
              defaultValue={video?.thumbnail ?? ""}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="rounded-xl bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white">
            Save video
          </button>
        </form>
        {video ? (
          <form action={removeLessonVideo} className="mt-3">
            <input type="hidden" name="lessonSlug" value={lesson.slug} />
            <button
              type="submit"
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              Remove video
            </button>
          </form>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <h2 className="mb-2 font-bold">Lesson images</h2>
        <p className="mb-4 text-xs text-[#666]">
          Without a custom URL, the fallback bar is shown using your width and alignment settings (no border).
        </p>

        {imageSlots.length === 0 ? (
          <p className="text-sm text-[#666]">This lesson has no image slots in the page flow.</p>
        ) : (
          <ul className="space-y-4">
            {imageSlots.map((slot) => {
              const override = overrideByPageId.get(slot.pageId);
              const config = override ? recordToLessonImageAdminConfig(override) : DEFAULT_LESSON_IMAGE_ADMIN_CONFIG;

              return (
                <li
                  key={slot.pageId}
                  className="rounded-xl border border-white/10 bg-[#141414] p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {slot.section === "practice" ? "Practice" : "Page"} ·{" "}
                        <span className="font-mono text-[#88C9F7]">{slot.pageId}</span>
                      </p>
                      <p className="mt-1 text-xs text-[#666]">
                        {slot.context} · {slot.alt}
                      </p>
                    </div>
                    {override ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                        Custom settings
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#666]">
                        Defaults
                      </span>
                    )}
                  </div>

                  {config.url ? (
                    <div
                      className={`mb-3 overflow-hidden rounded-xl border border-white/10 ${lessonImageAlignClass(config.align)}`}
                      style={{ width: `${config.widthPercent}%` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.url}
                        alt={slot.alt}
                        className="block h-auto w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className={`mb-3 block ${lessonImageAlignClass(config.align)}`}
                      style={{ width: `${config.widthPercent}%` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LESSON_FALLBACK_SRC}
                        alt={slot.alt}
                        className="block h-auto w-full object-contain"
                      />
                      <p className="mt-1 text-center text-[10px] text-[#666]">Fallback (no custom URL)</p>
                    </div>
                  )}

                  <form action={saveLessonImageSettings} className="space-y-2">
                    <input type="hidden" name="lessonSlug" value={lesson.slug} />
                    <input type="hidden" name="pageId" value={slot.pageId} />
                    <input type="hidden" name="alt" value={slot.alt} />
                    <label className="block text-xs text-[#999]">
                      Image / GIF URL (optional)
                      <input
                        name="url"
                        type="url"
                        defaultValue={config.url ?? ""}
                        placeholder="https://example.com/chart.gif"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block text-xs text-[#999]">
                        Width (% of column)
                        <input
                          name="widthPercent"
                          type="number"
                          min={10}
                          max={100}
                          step={1}
                          defaultValue={config.widthPercent}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-xs text-[#999]">
                        Alignment
                        <select
                          name="align"
                          defaultValue={config.align}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save image settings
                    </button>
                  </form>

                  {override ? (
                    <form action={removeLessonImageUrl} className="mt-2">
                      <input type="hidden" name="lessonSlug" value={lesson.slug} />
                      <input type="hidden" name="pageId" value={slot.pageId} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Reset to defaults
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
        <h2 className="mb-3 font-bold">Page types</h2>
        <ul className="space-y-2 text-sm text-[#999]">
          {lesson.pages.map((p, idx) => (
            <li key={p.id} className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
              {idx + 1}. <span className="text-white">{p.type}</span>
              {"visualId" in p && p.visualId ? ` · ${p.visualId}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
