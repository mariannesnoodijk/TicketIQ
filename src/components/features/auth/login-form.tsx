"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/dashboard/home" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Inloggen</h1>
        <p className="text-sm text-muted-foreground">
          Log in om supporttickets te analyseren met TicketIQ.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        <div className="space-y-2">
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="naam@bedrijf.nl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Wachtwoord</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Bezig met inloggen..." : "Inloggen"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nog geen account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Registreren
        </Link>
      </p>
    </div>
  );
}
