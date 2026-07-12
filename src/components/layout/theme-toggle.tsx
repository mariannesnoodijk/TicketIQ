"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Licht", icon: Sun },
  { value: "dark", label: "Donker", icon: Moon },
  { value: "system", label: "Systeem", icon: Monitor },
];

type ThemeToggleProps = {
  className?: string;
  /** Icon-only toggle between light and dark */
  compact?: boolean;
};

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("size-9 shrink-0", className)} aria-hidden />;
  }

  if (compact) {
    const isDark = resolvedTheme === "dark";

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
      >
        {isDark ? (
          <Moon className="size-4" aria-hidden="true" />
        ) : (
          <Sun className="size-4" aria-hidden="true" />
        )}
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)} role="group" aria-label="Thema">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={theme === value ? "default" : "outline"}
          size="sm"
          className="min-w-0 flex-1 gap-1.5 px-2"
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  );
}
