"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { cn } from "@/lib/utils";

export function EnrollButton({
  courseSlug,
  className,
}: {
  courseSlug: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function onEnroll() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/live-classes/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          returnUrl: window.location.origin,
        }),
      });

      if (res.status === 401) {
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
        return;
      }

      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error ?? "Unable to start enrollment right now.");
    } catch {
      alert("Enrollment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LiquidButton
      className={cn("w-full", className)}
      size="xxl"
      onClick={onEnroll}
      disabled={loading}
    >
      {loading ? "Redirecting..." : "Enroll Now"}
    </LiquidButton>
  );
}
