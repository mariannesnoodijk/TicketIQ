"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type AuthActionState } from "@/app/(auth)/actions";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

type LoginFormProps = {
  redirectTo?: string;
  authCallbackFailed?: boolean;
};

export function LoginForm({
  redirectTo = "/dashboard/home",
  authCallbackFailed = false,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const { locale } = useLocale();
  const t = useTranslations();

  return (
    <>
      {authCallbackFailed ? (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {t("auth.authCallbackFailed")}
        </p>
      ) : null}

      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <p className="brand-logo text-lg font-bold lg:hidden">TicketIQ</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t("auth.loginTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              spellCheck={false}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
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
            {pending ? t("auth.submitLoginPending") : t("auth.submitLogin")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </>
  );
}
