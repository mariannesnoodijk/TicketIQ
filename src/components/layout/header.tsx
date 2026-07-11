"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/features/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/tickets", label: "Tickets" },
  { href: "/dashboard/suggestions", label: "Suggesties" },
  { href: "/dashboard/analyze", label: "Analyse" },
  { href: "/dashboard/categories", label: "Categorieën" },
  { href: "/dashboard/labels", label: "Labels" },
];

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"} className="text-lg font-semibold tracking-tight">
            TicketIQ
          </Link>

          {user ? (
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

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

        <nav className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-muted-foreground">Laden...</span>
          ) : user ? (
            <LogoutButton />
          ) : (
            <>
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
    </header>
  );
}
