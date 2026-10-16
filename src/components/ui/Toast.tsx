"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { generateId } from "@/lib/generateId";

type ToastType = "success" | "warning" | "info" | "xp";
type ToastItem = { id: string; message: string; type: ToastType };
type ToastContextValue = { push: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: ToastType = "info") => {
    const id = generateId();
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
          className="tv-toast animate-in slide-in-from-right-4 duration-200"
          data-tone={item.type}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
