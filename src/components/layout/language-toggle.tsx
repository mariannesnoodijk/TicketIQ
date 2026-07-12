"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LOCALES, type Locale } from "@/lib/i18n/types";

type LanguageToggleProps = {
  className?: string;
  /** Compact NL/ENG segmented control for header */
  compact?: boolean;
};

function LanguageSegmentedControl({
  locale,
  setLocale,
  t,
  className,
  compact = false,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5",
        compact ? "gap-0" : "gap-1",
        className
      )}
      role="group"
      aria-label={t("language.group")}
    >
      {LOCALES.map(({ value, label }) => {
        const isActive = locale === value;

        return (
          <Button
            key={value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "min-w-0 font-semibold tracking-wide",
              compact ? "h-7 px-2 text-xs" : "px-2.5",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setLocale(value)}
            aria-pressed={isActive}
            aria-current={isActive ? "true" : undefined}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

export function LanguageToggle({ className, compact = false }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(compact ? "h-8 w-[4.5rem]" : "h-9 w-24", "shrink-0 rounded-lg", className)}
        aria-hidden
      />
    );
  }

  return (
    <LanguageSegmentedControl
      locale={locale}
      setLocale={setLocale}
      t={t}
      className={className}
      compact={compact}
    />
  );
}
