"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type FloatItem = { id: string; amount: number };
type XPFloatContextValue = { trigger: (amount: number) => void };

const XPFloatContext = createContext<XPFloatContextValue | null>(null);

export function XPFloatProvider({ children }: { children: React.ReactNode }) {
  const [floats, setFloats] = useState<FloatItem[]>([]);

  const trigger = useCallback((amount: number) => {
    const id = crypto.randomUUID();
    setFloats((prev) => [...prev, { id, amount }]);
    window.setTimeout(() => {
      setFloats((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  }, []);

  const value = useMemo(() => ({ trigger }), [trigger]);

  return (
    <XPFloatContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[110]">
        {floats.map((item, idx) => (
          <div
            key={item.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 text-2xl font-bold text-accent opacity-0 [animation:xp-float_1.2s_ease-out_forwards]"
            style={{ marginTop: idx * 8 }}
          >
            +{item.amount} XP
          </div>
        ))}
      </div>
    </XPFloatContext.Provider>
  );
}

export function useXPFloat() {
  const ctx = useContext(XPFloatContext);
  if (!ctx) throw new Error("useXPFloat must be used inside XPFloatProvider");
  return ctx;
}
