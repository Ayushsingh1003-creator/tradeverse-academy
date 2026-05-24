"use client";

import { useState } from "react";

export type CurriculumModule = { moduleTitle: string; lessons: string[] };

export function CurriculumBuilder({ initialJson }: { initialJson: string }) {
  const [modules, setModules] = useState<CurriculumModule[]>(() => {
    try {
      const v = JSON.parse(initialJson) as CurriculumModule[];
      return Array.isArray(v) && v.length ? v : [{ moduleTitle: "", lessons: [""] }];
    } catch {
      return [{ moduleTitle: "", lessons: [""] }];
    }
  });

  const addModule = () => setModules((m) => [...m, { moduleTitle: "", lessons: [""] }]);
  const removeModule = (i: number) => setModules((m) => m.filter((_, j) => j !== i));
  const updateModuleTitle = (i: number, v: string) =>
    setModules((m) => m.map((mod, j) => (j === i ? { ...mod, moduleTitle: v } : mod)));
  const addLesson = (mi: number) =>
    setModules((m) => m.map((mod, j) => (j === mi ? { ...mod, lessons: [...mod.lessons, ""] } : mod)));
  const updateLesson = (mi: number, li: number, v: string) =>
    setModules((m) =>
      m.map((mod, j) =>
        j === mi ? { ...mod, lessons: mod.lessons.map((l, k) => (k === li ? v : l)) } : mod,
      ),
    );
  const removeLesson = (mi: number, li: number) =>
    setModules((m) =>
      m.map((mod, j) => (j === mi ? { ...mod, lessons: mod.lessons.filter((_, k) => k !== li) } : mod)),
    );

  return (
    <div>
      <input type="hidden" name="curriculumJson" value={JSON.stringify(modules)} readOnly />
      <div className="space-y-3">
        {modules.map((mod, mi) => (
          <div key={mi} className="rounded-xl border border-white/10 bg-[#252525] p-4">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={mod.moduleTitle}
                onChange={(e) => updateModuleTitle(mi, e.target.value)}
                placeholder="Module title..."
                className="flex-1 rounded-lg border border-white/10 bg-[#1E1E1E] px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={() => removeModule(mi)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
            {mod.lessons.map((lesson, li) => (
              <div key={li} className="mb-2 flex items-center gap-2">
                <span className="w-5 text-xs text-[#555]">{li + 1}.</span>
                <input
                  value={lesson}
                  onChange={(e) => updateLesson(mi, li, e.target.value)}
                  placeholder="Lesson description..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-1.5 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => removeLesson(mi, li)}
                  className="text-sm text-[#555] hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addLesson(mi)} className="mt-1 text-xs text-[#456DFF] hover:underline">
              + Add lesson
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addModule}
        className="mt-3 w-full rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm text-[#666] hover:text-white"
      >
        + Add module
      </button>
    </div>
  );
}
