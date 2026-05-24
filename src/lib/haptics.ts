export function haptic(type: "light" | "medium" | "success" | "error") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const patterns: Record<typeof type, number[]> = {
    light: [10],
    medium: [30],
    success: [20, 50, 20],
    error: [50, 30, 50],
  };
  navigator.vibrate(patterns[type]);
}
