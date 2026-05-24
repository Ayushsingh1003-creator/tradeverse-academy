"use client";

import { type HTMLAttributes, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerVariant = "rainbow" | "normal";

export function Banner({
  id,
  storageRevision,
  xColor,
  variant = "normal",
  height = "3rem",
  rainbowColors = [
    "rgba(0,149,255,0.56)",
    "rgba(231,77,255,0.77)",
    "rgba(255,0,0,0.73)",
    "rgba(131,255,166,0.66)",
  ],
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  height?: string;
  xColor?: string;
  variant?: BannerVariant;
  rainbowColors?: string[];
  /** When set with `id`, dismiss is keyed per revision so a new site-banner save shows again for everyone. */
  storageRevision?: string;
}) {
  const [open, setOpen] = useState(true);
  const globalKey =
    id != null && id !== ""
      ? storageRevision != null && storageRevision !== ""
        ? `tv-banner-${id}--r-${storageRevision}`
        : `tv-banner-${id}`
      : null;

  useEffect(() => {
    if (globalKey) setOpen(localStorage.getItem(globalKey) !== "true");
  }, [globalKey]);

  if (!open) return null;

  return (
    <div
      id={id}
      {...props}
      className={cn(
        "sticky top-0 z-40 flex flex-row items-center justify-center px-4 text-center text-sm font-medium",
        variant === "normal" && "bg-[rgba(30,30,30,0.9)] backdrop-blur-sm",
        variant === "rainbow" && "bg-[rgba(20,20,20,0.9)]",
        props.className,
      )}
      style={{ height }}
    >
      {variant === "rainbow" ? flow({ colors: rainbowColors }) : null}

      <div className="max-w-4xl pr-10">{props.children}</div>

      {id ? (
        <button
          type="button"
          aria-label="Close Banner"
          onClick={() => {
            setOpen(false);
            if (globalKey) localStorage.setItem(globalKey, "true");
          }}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white md:right-5"
        >
          <X color={xColor} size={16} />
        </button>
      ) : null}
    </div>
  );
}

const maskImage =
  "linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)";

function flow({ colors }: { colors: string[] }) {
  return (
    <>
      <div
        className="absolute inset-0 z-[-1]"
        style={
          {
            maskImage,
            maskComposite: "intersect",
            animation: "tv-moving-banner 20s linear infinite",
            backgroundImage: `repeating-linear-gradient(70deg, ${[...colors, colors[0]].map((color, i) => `${color} ${(i * 50) / colors.length}%`).join(", ")})`,
            backgroundSize: "200% 100%",
            filter: "saturate(1.8)",
          } as object
        }
      />
      <style>
        {`@keyframes tv-moving-banner {
          from { background-position: 0% 0; }
          to { background-position: 100% 0; }
        }`}
      </style>
    </>
  );
}
