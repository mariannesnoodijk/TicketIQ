"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";

type PageLoadingProps = {
  messageKey: MessageKey | string;
};

export function PageLoading({ messageKey }: PageLoadingProps) {
  const t = useTranslations();

  return <p className="px-4 py-10 text-sm text-muted-foreground">{t(messageKey)}</p>;
}
