"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function SkipToContent() {
  const t = useTranslations();

  return (
    <a href="#main-content" className="skip-link">
      {t("common.skipToContent")}
    </a>
  );
}
