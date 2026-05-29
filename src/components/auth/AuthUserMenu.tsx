"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShowAdminNav } from "@/lib/admin/useShowAdminNav";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { signOutAction } from "@/lib/auth/sign-out-action";

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
          className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm md:inline-block"
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
          className="absolute right-0 top-[calc(100%+8px)] z-[200] w-64 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#1E1E1E] shadow-xl"
        >
          <div className="border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {user.email ? (
              <p className="mt-0.5 truncate text-xs text-[#999]">{user.email}</p>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#ccc] no-underline transition hover:bg-white/[0.06] hover:text-white"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#ccc] no-underline transition hover:bg-white/[0.06] hover:text-white"
            >
              Settings
            </Link>
            {showAdmin ? (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-[#F7C325] no-underline transition hover:bg-white/[0.06] hover:text-[#ffd45c]"
              >
                Admin
              </Link>
            ) : null}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] p-2">
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              onClick={() => {
                setOpen(false);
                void signOutAction();
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
