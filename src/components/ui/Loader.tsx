import { cn } from "@/lib/utils";

const SIZES = {
  sm: 40,
  md: 65,
  lg: 88,
} as const;

type LoaderSize = keyof typeof SIZES;

interface LoaderProps {
  size?: LoaderSize | number;
  className?: string;
  label?: string;
}

/**
 * Square chasing-border loader (inset ring animation).
 * Based on kristen17 / 21st-style loader pattern.
 */
export function Loader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const px = typeof size === "number" ? size : SIZES[size];

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative aspect-square shrink-0", className)}
      style={{ width: px }}
    >
      <span
        className="absolute rounded-[50px] shadow-[inset_0_0_0_3px] shadow-gray-100 animate-loader-anim"
        aria-hidden
      />
      <span
        className="absolute rounded-[50px] shadow-[inset_0_0_0_3px] shadow-gray-100 animate-loader-anim animate-loader-anim-delay"
        aria-hidden
      />
    </div>
  );
}

interface PageLoaderProps {
  label?: string;
  size?: LoaderSize | number;
  className?: string;
}

/** Centered loader for route loading.tsx and full-page fetches. */
export function PageLoader({ label, size = "md", className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Loader size={size} />
      {label ? <p className="text-sm text-text-muted">{label}</p> : null}
    </div>
  );
}
