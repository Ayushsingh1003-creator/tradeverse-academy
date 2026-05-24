export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
      <div className="h-full rounded-full bg-[linear-gradient(90deg,#3860BE,#456DFF,#88C9F7)] transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
