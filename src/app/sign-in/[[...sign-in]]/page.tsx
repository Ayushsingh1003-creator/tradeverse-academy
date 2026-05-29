import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserId } from "@/lib/auth/session";
import { AUTH_HOME_URL } from "@/lib/auth/urls";

type PageProps = {
  searchParams: { verified?: string };
};

export default async function SignInPage({ searchParams }: PageProps) {
  if (await getAuthUserId()) redirect(AUTH_HOME_URL);

  const authEnabled = isAuthConfigured();

  return (
    <AuthPageShell variant="sign-in" authEnabled={authEnabled}>
      {authEnabled ? <SignInForm emailVerified={searchParams.verified === "1"} /> : null}
    </AuthPageShell>
  );
}
