"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu, MobileAccountPanel } from "@/components/layout/account-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/tickets", label: "Tickets" },
  { href: "/dashboard/suggestions", label: "Helpcenter (AI)" },
  { href: "/dashboard/instellingen", label: "Instellingen" },
];

function isNavItemActive(pathname: string, href: string, exact?: boolean) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link
            href={user ? "/dashboard/home" : "/"}
            className="shrink-0 text-lg font-semibold tracking-tight"
          >
            TicketIQ
          </Link>

          {user ? (
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Hoofdnavigatie">
              {navItems.map((item) => {
                const isActive = isNavItemActive(pathname, item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Account">
          {user ? (
            <>
              <ThemeToggle compact className="hidden sm:inline-flex" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav"
                aria-label={mobileNavOpen ? "Menu sluiten" : "Menu openen"}
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                {mobileNavOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </Button>
            </>
          ) : null}

          {loading ? (
            <span className="text-sm text-muted-foreground">Laden…</span>
          ) : user ? (
            <AccountMenu user={user} className="hidden sm:block" />
          ) : (
            <>
              <ThemeToggle compact />
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Inloggen
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Registreren
              </Link>
            </>
          )}
        </nav>
      </div>

      {user ? (
        <nav
          id="mobile-nav"
          aria-label="Mobiele navigatie"
          aria-hidden={!mobileNavOpen}
          className={cn(
            "grid overflow-hidden border-t border-border transition-[grid-template-rows] duration-200 ease-out sm:hidden",
            mobileNavOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => {
                const isActive = isNavItemActive(pathname, item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-11 w-full justify-start",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <MobileAccountPanel user={user} />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
