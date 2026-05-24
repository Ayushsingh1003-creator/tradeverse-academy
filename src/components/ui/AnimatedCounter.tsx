"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({
  from,
  to,
  duration,
  className,
}: {
  from: number;
  to: number;
  duration: number;
  className?: string;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    setCount(from);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to, duration]);

  return <span className={className}>{count}</span>;
}
