"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { useClearTickets } from "@/hooks/useTickets";

export function ClearTicketsButton() {
  const { t } = useLocale();
  const clearTickets = useClearTickets();
  const [message, setMessage] = useState<string | null>(null);

  async function handleClear() {
    if (!confirm(t("tickets.clearConfirm"))) return;

    setMessage(null);
    try {
      const result = await clearTickets.mutateAsync();
      setMessage(t("tickets.clearSuccess", { count: result.deleted }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("tickets.clearFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => void handleClear()}
        disabled={clearTickets.isPending}
      >
        {clearTickets.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("tickets.clearing")}
          </>
        ) : (
          t("tickets.clear")
        )}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
