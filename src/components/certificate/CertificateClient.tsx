"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { COURSES } from "@/lib/data/courses";

export function CertificateClient({ courseId, userName }: { courseId: string; userName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const course = COURSES.find((item) => item.id === courseId);

  if (!course) return <main className="p-8">Certificate not available.</main>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div ref={ref} className="w-full max-w-3xl rounded-3xl border-4 border-accent bg-surface p-10 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-text-muted">Tradeverse Academy</p>
        <h1 className="mt-4 text-4xl font-bold text-accent">Certificate of Completion</h1>
        <p className="mt-8 text-text-muted">Awarded to:</p>
        <p className="mt-1 text-3xl font-semibold">{userName}</p>
        <p className="mt-8 text-text-muted">for successfully completing</p>
        <p className="mt-2 text-4xl font-bold text-accent">{course.title}</p>
        <p className="mt-8 text-sm text-text-muted">Tradeverse Academy · {new Date().toLocaleDateString()}</p>
      </div>
      <button
        onClick={async () => {
          if (!ref.current) return;
          const dataUrl = await toPng(ref.current);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `tradeverse-${course.slug}-certificate.png`;
          link.click();
        }}
        className="rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900"
      >
        Download as PNG
      </button>
    </main>
  );
}
