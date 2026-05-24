import { SignUp } from "@clerk/nextjs";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { clerkAuthAppearance } from "@/lib/clerkAppearance";
import {
  CLERK_AFTER_SIGN_UP_URL,
  CLERK_SIGN_IN_URL,
} from "@/lib/clerkUrls";

export default function SignUpPage() {
  const clerkEnabled = isClerkConfigured();

  return (
    <AuthPageShell variant="sign-up" clerkEnabled={clerkEnabled}>
      {clerkEnabled ? (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl={CLERK_SIGN_IN_URL}
          forceRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
          fallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
          appearance={clerkAuthAppearance}
        />
      ) : null}
    </AuthPageShell>
  );
}
