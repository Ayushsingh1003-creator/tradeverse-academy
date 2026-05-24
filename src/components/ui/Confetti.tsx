"use client";

import { useEffect, useState } from "react";

export type ConfettiPiece = {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  angle: number;
  rounded: boolean;
};

type ConfettiProps = {
  active: boolean;
  /** ~24 small, ~48 lesson, ~64 big */
  count?: number;
};

const COLORS = ["#F7C325", "#456DFF", "#3B82F6", "#F59E0B", "#9D62FF", "#FF5D5D"];

export function Confetti({ active, count = 24 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[i % COLORS.length]!,
        delay: Math.random() * 0.35,
        size: 6 + Math.random() * 7,
        angle: Math.random() * 360,
        rounded: Math.random() > 0.45,
      })),
    );
    const t = window.setTimeout(() => setPieces([]), 1400);
    return () => window.clearTimeout(t);
  }, [active, count]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[140] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.rounded ? "50%" : "2px",
            transform: `rotate(${p.angle}deg)`,
            animation: `confetti-burst ${0.75 + Math.random() * 0.45}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
