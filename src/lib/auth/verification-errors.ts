/** Detect Neon / Better Auth errors for unverified or duplicate accounts. */
export function isUserAlreadyExistsError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("already exists") ||
    m.includes("user_already") ||
    m.includes("already registered")
  );
}

export function isEmailNotVerifiedError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("not verified") ||
    m.includes("email_not_verified") ||
    m.includes("verify your email") ||
    m.includes("email verification")
  );
}
