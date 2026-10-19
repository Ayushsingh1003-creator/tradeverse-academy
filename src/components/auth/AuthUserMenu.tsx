"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShowAdminNav } from "@/lib/admin/useShowAdminNav";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { AUTH_AFTER_SIGN_OUT_URL } from "@/lib/auth/urls";
import { signOut } from "@/lib/auth/sign-out-client";

function userInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

export function AuthUserMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useAuthSession();
  const showAdmin = useShowAdminNav();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (isLoading) {
    return <span className="inline-block h-[34px] w-[34px] animate-pulse rounded-full bg-white/10" aria-hidden />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/sign-in"
          className="rounded-full border border-[var(--tv-line)] px-4 py-2 text-sm md:inline-block"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="hidden rounded-full bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A4AE8] md:inline-block"
        >
          Start Free
        </Link>
      </>
    );
  }

  const initials = userInitials(user.name, user.email);
  const displayName = user.name?.trim() || "Account";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#456DFF] text-xs font-bold text-white ring-2 ring-transparent transition hover:ring-[#456DFF]/40 focus-visible:outline-none focus-visible:ring-[#456DFF]/60"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[200] w-64 overflow-hidden rounded-2xl border border-[var(--tv-line)] bg-[var(--tv-pane)] shadow-[0_12px_32px_var(--tv-card-shadow)]"
        >
          <div className="border-b border-[var(--tv-line)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[color:var(--tv-ink)]">{displayName}</p>
            {user.email ? (
              <p className="mt-0.5 truncate text-xs text-[color:var(--tv-mute)]">{user.email}</p>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[color:var(--tv-mute)] no-underline transition hover:bg-[var(--tv-sunk)] hover:text-[color:var(--tv-ink)]"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[color:var(--tv-mute)] no-underline transition hover:bg-[var(--tv-sunk)] hover:text-[color:var(--tv-ink)]"
            >
              Settings
            </Link>
            {showAdmin ? (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-[color:var(--tv-gold-chip)] no-underline transition hover:bg-[var(--tv-sunk)]"
              >
                Admin
              </Link>
            ) : null}
          </div>
          <div className="border-t border-[var(--tv-line)] p-2">
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[color:var(--tv-down)] transition hover:bg-[rgba(239,75,75,0.10)]"
              onClick={() => {
                setOpen(false);
                void (async () => {
                  await signOut();
                  window.location.assign(AUTH_AFTER_SIGN_OUT_URL);
                })();
              }}
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
