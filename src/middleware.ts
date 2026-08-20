import { NextResponse, type NextRequest } from "next/server";
import { resolveIsAdmin } from "@/lib/admin/checkAdmin";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { verifyTradeverseIdAccessToken, type TradeverseIdSessionUser } from "@/lib/auth/tradeverseId";
import { AUTH_HOME_URL, AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { ONBOARDING_BYPASS_PREFIXES, ONBOARDING_URL } from "@/lib/onboarding/constants";
import { needsOnboardingForAuthUser } from "@/lib/onboarding/needsAssessment";

const PUBLIC_PREFIXES = [
  "/",
  "/dashboard",
  "/courses",
  "/live-classes",
  "/paths",
  "/library",
  "/sign-in",
  "/sign-up",
];

const PROTECTED_PREFIXES = [
  "/learn",
  "/practice",
  "/leaderboard",
  "/profile",
  "/settings",
  "/certificate",
  "/simulator",
  "/refer",
  "/analytics",
  "/community",
  "/review",
  "/live",
  "/teams",
  "/marketplace",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isOnboardingBypass(pathname: string) {
  return ONBOARDING_BYPASS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p),
  );
}

function isOnboardingPath(pathname: string) {
  return pathname === ONBOARDING_URL || pathname.startsWith(`${ONBOARDING_URL}/`);
}

/** Reads and verifies the shared Tradeverse ID session cookie — no network round
 * trip, just a local signature check (see src/lib/auth/tradeverseId.ts). This is
 * also what makes cross-app SSO "silent": if the user just logged in on W1, the
 * browser already carries this cookie on its first request to this app. */
async function getMiddlewareSession(
  request: NextRequest,
): Promise<{ user: TradeverseIdSessionUser } | null> {
  const token = request.cookies.get("tv_session")?.value;
  if (!token) return null;
  const user = await verifyTradeverseIdAccessToken(token);
  return user ? { user } : null;
}

/** Signed-out users must not stay on the assessment page. */
async function requireAuthForOnboarding(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> {
  if (!isOnboardingPath(pathname)) return null;

  const session = await getMiddlewareSession(request);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(AUTH_SIGN_IN_URL, request.url));
  }

  return null;
}

async function onboardingRedirectIfNeeded(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> {
  if (isOnboardingBypass(pathname)) return null;

  const session = await getMiddlewareSession(request);
  const authUserId = session?.user?.id;
  if (!authUserId) return null;

  const email = session?.user?.email ?? null;
  if (await needsOnboardingForAuthUser(authUserId, email)) {
    return NextResponse.redirect(new URL(ONBOARDING_URL, request.url));
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const orgMatch = host.match(/^([a-z0-9-]+)\.academy\.tradeverse\.io$/i);
  const requestHeaders = new Headers(request.headers);
  if (orgMatch) {
    requestHeaders.set("x-tv-org-slug", orgMatch[1].toLowerCase());
  }

  const pathname = request.nextUrl.pathname;

  if (!isAuthConfigured()) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const onboardingAuthRedirect = await requireAuthForOnboarding(request, pathname);
  if (onboardingAuthRedirect) return onboardingAuthRedirect;

  const onboardingRedirect = await onboardingRedirectIfNeeded(request, pathname);
  if (onboardingRedirect) return onboardingRedirect;

  if (matchesPrefix(pathname, PUBLIC_PREFIXES) && !matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    if (!pathname.startsWith("/admin")) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const session = await getMiddlewareSession(request);
    if (!session?.user?.id) {
      const signInUrl = new URL(AUTH_SIGN_IN_URL, request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (pathname.startsWith("/admin")) {
    const session = await getMiddlewareSession(request);
    if (!session?.user) {
      return NextResponse.redirect(new URL(AUTH_SIGN_IN_URL, request.url));
    }
    const email = session.user.email ?? "";
    const authUserId = session.user.id ?? null;
    if (!(await resolveIsAdmin(email, authUserId))) {
      return NextResponse.redirect(new URL(AUTH_HOME_URL, request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/",
    "/courses/:path*",
    "/live-classes/:path*",
    "/paths/:path*",
    "/api/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/certificate/:path*",
    "/simulator/:path*",
    "/refer/:path*",
    "/analytics/:path*",
    "/community/:path*",
    "/review/:path*",
    "/live/:path*",
    "/teams/:path*",
    "/marketplace/:path*",
    "/library/:path*",
    "/xp/:path*",
    "/progress/:path*",
    "/premium/:path*",
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
