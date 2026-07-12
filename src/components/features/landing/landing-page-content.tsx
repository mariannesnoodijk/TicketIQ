"use client";

import { BarChart3, Bot, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Header } from "@/components/layout/header";
import { useTranslations } from "@/components/providers/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const enterDelays = ["0ms", "80ms", "160ms", "240ms", "360ms", "480ms", "600ms"] as const;

export function LandingPageContent() {
  const t = useTranslations();

  const features = [
    {
      icon: Bot,
      title: t("landing.featureAiTitle"),
      description: t("landing.featureAiDescription"),
      accent: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-300",
    },
    {
      icon: BarChart3,
      title: t("landing.featureTrendTitle"),
      description: t("landing.featureTrendDescription"),
      accent: "from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-300",
    },
    {
      icon: Sparkles,
      title: t("landing.featureHelpTitle"),
      description: t("landing.featureHelpDescription"),
      accent: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-300",
    },
  ] as const;

  return (
    <div className="hero-bg flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        className="hero-orb -left-24 top-32 size-72 bg-brand-fuchsia/25 dark:bg-brand-fuchsia/15"
        aria-hidden="true"
      />
      <div
        className="hero-orb right-0 top-16 size-96 bg-brand-cyan/20 dark:bg-brand-cyan/10"
        style={{ animationDelay: "-4s" }}
        aria-hidden="true"
      />
      <div
        className="hero-orb bottom-0 left-1/3 size-80 bg-brand-violet/15 dark:bg-brand-violet/10"
        style={{ animation: "hero-float-alt 16s ease-in-out infinite", animationDelay: "-2s" }}
        aria-hidden="true"
      />

      <div className="animate-enter-fade" style={{ "--enter-delay": enterDelays[0] } as CSSProperties}>
        <Header />
      </div>

      <main className="relative flex flex-1 flex-col px-4 pb-20 pt-12 sm:pt-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center">
          <p
            className="animate-enter inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm"
            style={{ "--enter-delay": enterDelays[1] } as CSSProperties}
          >
            <Zap className="size-3.5 animate-pulse" aria-hidden="true" />
            {t("landing.badge")}
          </p>

          <div
            className="animate-enter space-y-5"
            style={{ "--enter-delay": enterDelays[2] } as CSSProperties}
          >
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("landing.titlePrefix")}{" "}
              <span className="text-gradient-animated">TicketIQ</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t("landing.subtitle")}
            </p>
          </div>

          <div
            className="animate-enter flex flex-wrap items-center justify-center gap-3"
            style={{ "--enter-delay": enterDelays[3] } as CSSProperties}
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "animate-glow-pulse shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              {t("landing.ctaStart")}
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-primary/20 bg-card/60 backdrop-blur-sm hover:bg-accent/80"
              )}
            >
              {t("landing.ctaLogin")}
            </Link>
          </div>

          <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="surface-card surface-card-interactive group animate-enter-scale rounded-2xl p-6 text-left"
                style={{ "--enter-delay": enterDelays[4 + index] } as CSSProperties}
              >
                <div
                  className={cn(
                    "icon-hover-pop mb-4 inline-flex rounded-xl bg-gradient-to-br p-2.5",
                    feature.accent
                  )}
                >
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
