"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { useImportTickets } from "@/hooks/useImportTickets";

export function ImportTicketsButton() {
  const { t } = useLocale();
  const importTickets = useImportTickets();
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport() {
    setMessage(null);
    try {
      const result = await importTickets.mutateAsync();
      const backfilledPart =
        result.backfilled && result.backfilled > 0
          ? t("tickets.importBackfilled", { backfilled: result.backfilled })
          : "";
      setMessage(
        t("tickets.importSuccessTotal", {
          imported: result.imported,
          skipped: result.skipped,
          total: result.total,
          backfilled: backfilledPart,
        })
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("tickets.importFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleImport} disabled={importTickets.isPending}>
        {importTickets.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("tickets.importing")}
          </>
        ) : (
          t("tickets.import")
        )}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
