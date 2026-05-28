/** Local Clerk routes — avoids redirect loops to *.accounts.dev in development. */
export const CLERK_SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
export const CLERK_SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";
/** Public landing for signed-out users (dashboard home). */
export const CLERK_HOME_URL = process.env.NEXT_PUBLIC_CLERK_HOME_URL ?? "/dashboard";
export const CLERK_AFTER_SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/dashboard";
export const CLERK_AFTER_SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/dashboard";
export const CLERK_AFTER_SIGN_OUT_URL =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL ?? CLERK_HOME_URL;
