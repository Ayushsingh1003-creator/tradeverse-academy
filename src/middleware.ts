import { NextResponse, type NextRequest } from "next/server";
import { resolveIsAdmin } from "@/lib/admin/checkAdmin";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { neonAuth } from "@/lib/auth/server";
import { AUTH_HOME_URL, AUTH_SIGN_IN_URL } from "@/lib/auth/urls";

const PUBLIC_PREFIXES = [
  "/",
  "/dashboard",
  "/courses",
  "/pricing",
  "/about",
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
  "/creator",
  "/marketplace",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
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
    const { data: session } = await neonAuth.getSession();
    if (!session?.user) {
      return NextResponse.redirect(new URL(AUTH_SIGN_IN_URL, request.url));
    }
    const email = session.user.email ?? "";
    const authUserId = session.user.id ?? null;
    if (!(await resolveIsAdmin(email, authUserId))) {
      return NextResponse.redirect(new URL(AUTH_HOME_URL, request.url));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/",
    "/courses/:path*",
    "/pricing/:path*",
    "/about/:path*",
    "/live-classes/:path*",
    "/paths/:path*",
    "/api/:path*",
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
    "/creator/:path*",
    "/marketplace/:path*",
    "/library/:path*",
    "/xp/:path*",
    "/progress/:path*",
    "/premium/:path*",
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/auth/callback",
  ],
};
