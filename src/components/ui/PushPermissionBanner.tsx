"use client";

import { useEffect, useState } from "react";

export function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") return;
      const done = window.localStorage.getItem("tv_first_lesson_done");
      const dismissed = window.localStorage.getItem("tv_push_dismissed");
      const canAsk = "Notification" in window && Notification.permission === "default";
      setVisible(Boolean(done && !dismissed && canAsk));
    };
    sync();
    window.addEventListener("tv-lesson-complete", sync);
    return () => window.removeEventListener("tv-lesson-complete", sync);
  }, []);

  if (!visible) return null;

  const enable = async () => {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      window.localStorage.setItem("tv_push_dismissed", "1");
      setVisible(false);
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapid) {
        window.localStorage.setItem("tv_push_dismissed", "1");
        setVisible(false);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
    } catch {
      /* ignore */
    }
    window.localStorage.setItem("tv_push_dismissed", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-lg rounded-2xl border border-accent/40 bg-surface p-4 shadow-xl md:left-auto md:right-6 md:mx-0">
      <p className="text-sm font-medium">Get streak reminders on your phone?</p>
      <p className="mt-1 text-xs text-text-muted">Enable notifications once — we only send useful trading nudges.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900" onClick={() => void enable()}>
          Enable Notifications
        </button>
        <button
          type="button"
          className="rounded-2xl border border-border px-4 py-2 text-sm"
          onClick={() => {
            window.localStorage.setItem("tv_push_dismissed", "1");
            setVisible(false);
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
