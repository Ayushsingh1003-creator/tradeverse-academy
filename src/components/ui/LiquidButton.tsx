"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const LIQUID_GLASS_BACKDROP = 'url("#container-glass")';

const liquidButtonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-transparent text-primary hover:scale-105 duration-300",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        nav: "h-10 rounded-full px-5 text-sm has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const glassShadowClass =
  "pointer-events-none absolute inset-0 z-0 h-full w-full rounded-full shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] transition-all dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]";

function LiquidGlassLayers() {
  return (
    <>
      <div className={glassShadowClass} aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 isolate -z-10 h-full w-full overflow-hidden rounded-md border border-white/15 bg-white/[0.14] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]"
        style={{ backdropFilter: LIQUID_GLASS_BACKDROP }}
        aria-hidden
      />
    </>
  );
}

function LiquidGlassContent({ children }: { children: React.ReactNode }) {
  return <div className="pointer-events-none relative z-10">{children}</div>;
}

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const shellClass = cn(
      "relative overflow-hidden",
      liquidButtonVariants({ variant, size, className }),
    );

    if (asChild) {
      return (
        <span data-slot="liquid-button" className={shellClass}>
          <LiquidGlassLayers />
          <Slot
            ref={ref}
            className="relative z-10 inline-flex h-full w-full items-center justify-center no-underline"
            {...props}
          >
            {children}
          </Slot>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        data-slot="liquid-button"
        className={shellClass}
        {...props}
      >
        <LiquidGlassLayers />
        <LiquidGlassContent>{children}</LiquidGlassContent>
      </button>
    );
  },
);
LiquidButton.displayName = "LiquidButton";

export { LiquidButton, liquidButtonVariants };
