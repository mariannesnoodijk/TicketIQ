"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useImportTickets } from "@/hooks/useImportTickets";

export function ImportTicketsButton() {
  const importTickets = useImportTickets();
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport() {
    setMessage(null);
    try {
      const result = await importTickets.mutateAsync();
      const backfilledPart =
        result.backfilled && result.backfilled > 0
          ? ` ${result.backfilled} bestaande tickets gecategoriseerd.`
          : "";
      setMessage(
        `${result.imported} tickets geïmporteerd, ${result.skipped} overgeslagen (totaal ${result.total}).${backfilledPart}`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import mislukt");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleImport} disabled={importTickets.isPending}>
        {importTickets.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Importeren...
          </>
        ) : (
          "Importeer tickets uit DummyJSON"
        )}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
