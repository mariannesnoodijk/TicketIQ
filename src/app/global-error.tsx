"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 text-center">
          <h1 className="text-xl font-semibold">Er ging iets mis</h1>
          <p className="text-sm text-muted-foreground">
            De applicatie heeft een onverwachte fout ondervonden.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className={cn(buttonVariants())}
              onClick={reset}
            >
              Opnieuw proberen
            </button>
            <a href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Naar startpagina
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
