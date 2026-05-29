import Image from "next/image";
import Link from "next/link";
import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { LiveCohortNavButton } from "@/components/layout/LiveCohortNavButton";
import { NavLink } from "@/components/layout/NavLink";
import { AUTH_HOME_URL } from "@/lib/auth/urls";

export function PublicNav() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#141414]"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1200px] items-center px-5">
        <Link href={AUTH_HOME_URL} className="mr-8 flex items-center no-underline">
          <Image
            src="/images/app-logo.png"
            alt="Tradeverse Academy"
            width={48}
            height={48}
            priority
            className="h-9 w-9 object-contain"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink href={AUTH_HOME_URL}>Home</NavLink>
          <NavLink href="/courses">Courses</NavLink>
          <NavLink href="/library">Library</NavLink>
          <LiveCohortNavButton />
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <AuthUserMenu />
        </div>
      </nav>
    </header>
  );
}
