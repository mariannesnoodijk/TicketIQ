"use client";

import { Sparkles } from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";

export function AuthBrandPanel() {
  const t = useTranslations();

  return (
    <div className="auth-brand-panel hidden w-1/2 flex-col justify-between bg-brand-gradient p-10 text-white lg:flex">
      <p className="text-xl font-bold tracking-tight">TicketIQ</p>
      <div className="space-y-6">
        <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
          <Sparkles className="size-8" aria-hidden="true" />
        </div>
        <blockquote className="space-y-3">
          <p className="text-3xl font-semibold leading-snug tracking-tight">{t("auth.brandQuote")}</p>
          <p className="max-w-md text-base text-white/80">{t("auth.brandDescription")}</p>
        </blockquote>
      </div>
      <p className="text-sm text-white/60">{t("auth.brandFooter")}</p>
    </div>
  );
}
