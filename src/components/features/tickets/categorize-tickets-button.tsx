"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCategorizeTickets } from "@/hooks/useCategorizeTickets";

export function CategorizeTicketsButton() {
  const categorizeTickets = useCategorizeTickets();
  const [message, setMessage] = useState<string | null>(null);

  async function handleCategorize() {
    setMessage(null);
    try {
      const result = await categorizeTickets.mutateAsync();
      setMessage(
        result.categorized > 0
          ? `${result.categorized} tickets gecategoriseerd.`
          : "Alle tickets hadden al een categorie."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Categorisatie mislukt");
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
            <Loader2 className="size-4 animate-spin" />
            Categoriseren...
          </>
        ) : (
          "Categoriseer bestaande tickets"
        )}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
