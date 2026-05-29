import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserId } from "@/lib/auth/session";
import { AUTH_HOME_URL } from "@/lib/auth/urls";
import { buildVerificationResumeState } from "@/lib/auth/verification-flow";
import type { SignUpFormState } from "@/lib/auth/form-state";

type PageProps = {
  searchParams: { email?: string; verify?: string };
};

export default async function SignUpPage({ searchParams }: PageProps) {
  if (await getAuthUserId()) redirect(AUTH_HOME_URL);

  const authEnabled = isAuthConfigured();
  const email = searchParams.email?.trim();
  const shouldResume = searchParams.verify === "1" && email;

  let initialState: SignUpFormState = null;
  if (shouldResume && authEnabled) {
    initialState = await buildVerificationResumeState(email, "sign-up");
  }

  return (
    <AuthPageShell variant="sign-up" authEnabled={authEnabled}>
      {authEnabled ? <SignUpForm initialState={initialState} defaultEmail={email} /> : null}
    </AuthPageShell>
  );
}
