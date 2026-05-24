"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "warning" | "info" | "xp";
type ToastItem = { id: string; message: string; type: ToastType };
type ToastContextValue = { push: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

const typeClass: Record<ToastType, string> = {
  success: "border-[#456DFF]/40 bg-[rgba(69,109,255,0.15)] text-[#88C9F7]",
  warning: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  info: "border-blue-400/40 bg-blue-500/15 text-blue-100",
  xp: "border-accent/50 bg-accent/15 text-yellow-100",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer items={items} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function ToastContainer({ items }: { items: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-80 flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`animate-in slide-in-from-right-4 rounded-2xl border px-4 py-3 shadow-lg duration-200 ${typeClass[item.type]}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
