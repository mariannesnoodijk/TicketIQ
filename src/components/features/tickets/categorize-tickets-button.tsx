"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { useCategorizeTickets } from "@/hooks/useCategorizeTickets";

export function CategorizeTicketsButton() {
  const { t } = useLocale();
  const categorizeTickets = useCategorizeTickets();
  const [message, setMessage] = useState<string | null>(null);

  async function handleCategorize() {
    setMessage(null);
    try {
      const result = await categorizeTickets.mutateAsync();
      setMessage(
        result.categorized > 0
          ? t("tickets.categorizeSuccess", { count: result.categorized })
          : t("tickets.categorizeAllDone")
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("tickets.categorizeFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={handleCategorize}
        disabled={categorizeTickets.isPending}
      >
        {categorizeTickets.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("tickets.categorizing")}
          </>
        ) : (
          t("tickets.categorize")
        )}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
