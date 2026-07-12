"use client";

import { LanguageToggle } from "@/components/layout/language-toggle";

export function AuthLocaleToggle() {
  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <LanguageToggle compact />
    </div>
  );
}
