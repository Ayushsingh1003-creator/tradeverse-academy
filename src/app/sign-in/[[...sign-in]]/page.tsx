import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { clerkAuthAppearance } from "@/lib/clerkAppearance";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_SIGN_UP_URL,
} from "@/lib/clerkUrls";

export default function SignInPage() {
  const clerkEnabled = isClerkConfigured();

  return (
    <AuthPageShell variant="sign-in" clerkEnabled={clerkEnabled}>
      {clerkEnabled ? (
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl={CLERK_SIGN_UP_URL}
          forceRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
          fallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
          appearance={clerkAuthAppearance}
        />
      ) : null}
    </AuthPageShell>
  );
}
