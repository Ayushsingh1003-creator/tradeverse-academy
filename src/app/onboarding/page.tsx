import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { OnboardingAssessmentClient } from "@/components/onboarding/OnboardingAssessmentClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { AUTH_HOME_URL, AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { resolveUserForAuth } from "@/lib/server/resolveDbUser";
import { userNeedsOnboardingAssessment } from "@/lib/onboarding/needsAssessment";

export const metadata = {
  title: "Onboarding assessment",
};

export default async function OnboardingPage() {
  if (!isAuthConfigured()) {
    redirect(AUTH_HOME_URL);
  }

  const authUserId = await getAuthUserId();
  if (!authUserId) {
    redirect(AUTH_SIGN_IN_URL);
  }

  const email = await getAuthUserEmail();
  const dbUser = await resolveUserForAuth(authUserId, email);
  if (dbUser && !userNeedsOnboardingAssessment(dbUser)) {
    redirect(AUTH_HOME_URL);
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#141414]">
      <AppNav />
      <div className="px-4 py-12">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent">Tradeverse Academy</p>
        <h1 className="mt-1 text-xl font-bold text-white">Welcome — let&apos;s personalize your path</h1>
      </div>
      <OnboardingAssessmentClient />
      </div>
    </main>
  );
}
