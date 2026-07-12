"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { logout } from "@/app/(auth)/actions";
import { useTranslations } from "@/components/providers/locale-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { getUserDisplayName } from "@/lib/auth/displayName";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  user: User;
  className?: string;
};

function getInitials(displayName: string | undefined, email: string | undefined) {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() ?? "?";
}

export function AccountMenu({ user, className }: AccountMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = getUserDisplayName(user.user_metadata);
  const email = user.email ?? "";
  const label = displayName ?? email;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="max-w-[12rem] gap-2 pl-2"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
          aria-hidden="true"
        >
          {getInitials(displayName, email)}
        </span>
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          <div className="flex items-start gap-3 border-b border-border px-2 py-2">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
              aria-hidden="true"
            >
              {getInitials(displayName, email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {displayName ?? t("common.accountFallback")}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/instellingen"
              role="menuitem"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-9 w-full justify-start gap-2"
              )}
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4" aria-hidden="true" />
              {t("nav.settings")}
            </Link>
          </div>

          <div className="border-t border-border px-2 py-2">
            <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              {t("common.display")}
            </p>
            <ThemeToggle />
          </div>

          <div className="border-t border-border pt-1">
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                role="menuitem"
                className="h-9 w-full justify-start gap-2"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {t("auth.logout")}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type MobileAccountPanelProps = {
  user: User;
};

export function MobileAccountPanel({ user }: MobileAccountPanelProps) {
  const t = useTranslations();
  const displayName = getUserDisplayName(user.user_metadata);
  const email = user.email ?? "";

  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-border pt-3">
      <div className="flex items-center gap-3 px-1">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
          aria-hidden="true"
        >
          {getInitials(displayName, email)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {displayName ?? t("common.accountFallback")}
          </p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="px-1">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t("common.display")}</p>
        <ThemeToggle />
      </div>

      <form action={logout} className="px-1">
        <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
          <LogOut className="size-4" aria-hidden="true" />
          {t("auth.logout")}
        </Button>
      </form>
    </div>
  );
}
