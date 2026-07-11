"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/features/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/"} className="text-lg font-semibold tracking-tight">
          TicketIQ
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-muted-foreground">Laden...</span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
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
