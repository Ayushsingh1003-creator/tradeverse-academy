import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { getServerAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { CLERK_HOME_URL } from "@/lib/clerkUrls";

const isPublicRoute = createRouteMatcher([
  "/",
  "/courses(.*)",
  "/pricing(.*)",
  "/about(.*)",
  "/live-classes(.*)",
  "/paths(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isPublicAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/learn(.*)",
  "/practice(.*)",
  "/leaderboard(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/certificate(.*)",
  "/simulator(.*)",
  "/refer(.*)",
  "/analytics(.*)",
  "/community(.*)",
  "/review(.*)",
  "/live(.*)",
  "/teams(.*)",
  "/creator(.*)",
  "/marketplace(.*)",
  "/library(.*)",
]);

const isAdmin = createRouteMatcher(["/admin(.*)"]);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, request) => {
    const host = request.headers.get("host") ?? "";
    const orgMatch = host.match(/^([a-z0-9-]+)\.academy\.tradeverse\.io$/i);
    const requestHeaders = new Headers(request.headers);
    if (orgMatch) {
      requestHeaders.set("x-tv-org-slug", orgMatch[1].toLowerCase());
    }

    if (isPublicRoute(request)) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (isPublicAuthRoute(request)) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (isProtected(request)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL(CLERK_HOME_URL, request.url));
      }
    }
    if (isAdmin(request)) {
      const { userId } = await auth();
      if (!userId) return NextResponse.redirect(new URL(CLERK_HOME_URL, request.url));

      const allow = getServerAdminAllowlist();
      if (allow.length > 0) {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const email =
          user.emailAddresses.find((a) => a.id === user.primaryEmailAddressId)?.emailAddress ?? "";
        if (!isAdminEmail(email, allow)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  })(request, event);
}

/**
 * Clerk must run on every route that calls auth() / currentUser() (see Clerk docs).
 * Public marketing pages like /courses and /live-classes stay excluded for faster compiles.
 */
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
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
  ],
};
