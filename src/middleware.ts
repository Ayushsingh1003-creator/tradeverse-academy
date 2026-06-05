import { NextResponse, type NextRequest } from "next/server";
import { resolveIsAdmin } from "@/lib/admin/checkAdmin";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { neonAuth } from "@/lib/auth/server";
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
  "/auth/callback",
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

/** Signed-out users must not stay on the assessment page. */
async function requireAuthForOnboarding(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> {
  if (!isOnboardingPath(pathname)) return null;

  let session: { user?: { id?: string } } | null = null;
  try {
    ({ data: session } = await neonAuth.getSession());
  } catch {
    return NextResponse.redirect(new URL(AUTH_SIGN_IN_URL, request.url));
  }

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

  let session: { user?: { id?: string; email?: string | null } } | null = null;
  try {
    ({ data: session } = await neonAuth.getSession());
  } catch {
    return null;
  }

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
    const handler = neonAuth.middleware({ loginUrl: AUTH_SIGN_IN_URL });
    const res = await handler(request);
    if (res.status >= 300 && res.status < 400) return res;
  }

  if (pathname.startsWith("/admin")) {
    let session: { user?: { id?: string; email?: string | null } } | null = null;
    try {
      ({ data: session } = await neonAuth.getSession());
    } catch {
      return NextResponse.redirect(new URL(AUTH_SIGN_IN_URL, request.url));
    }
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
    "/auth/callback",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
