"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** True when the current route is this nav item (or a child route). */
export function isNavLinkActive(pathname: string, href: string): boolean {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";

  if (target === "/" || target === "/courses" || target === "/dashboard") {
    return path === "/" || path === "/courses" || path.startsWith("/courses/") || path === "/dashboard";
  }

  return path === target || path.startsWith(`${target}/`);
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = isNavLinkActive(pathname, href);

  return (
    <Link
      href={href}
      prefetch
      className={`text-sm font-semibold no-underline transition-colors ${
        active ? "text-white" : "text-[#999] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
