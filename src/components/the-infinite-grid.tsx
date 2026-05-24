"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useEffect } from "react";

const GRID_SIZE = 40;
const SPEED_X = 0.25;
const SPEED_Y = 0.25;

export function InfiniteGridBackground() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    const onLeave = () => {
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [mouseX, mouseY]);

  useAnimationFrame(() => {
    if (reduceMotion) return;
    gridOffsetX.set((gridOffsetX.get() + SPEED_X) % GRID_SIZE);
    gridOffsetY.set((gridOffsetY.get() + SPEED_Y) % GRID_SIZE);
  });

  const maskImage = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden"
      )}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-[0.05]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      <motion.div
        className="absolute inset-0 opacity-35"
        style={reduceMotion ? undefined : { maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      <div className="absolute inset-0">
        <div className="absolute right-[-20%] top-[-20%] h-[40%] w-[40%] rounded-full bg-orange-500/30 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] h-[20%] w-[20%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/30 blur-[120px]" />
      </div>
    </div>
  );
}

function GridPattern({
  offsetX,
  offsetY,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
}) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="tradeverse-grid-pattern"
          width={String(GRID_SIZE)}
          height={String(GRID_SIZE)}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tradeverse-grid-pattern)" />
    </svg>
  );
}