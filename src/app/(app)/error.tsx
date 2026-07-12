"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Er ging iets mis</h1>
      <p className="text-sm text-muted-foreground">
        Deze pagina kon niet worden geladen. Probeer het opnieuw of ga terug naar het
        dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={reset}>
          Opnieuw proberen
        </Button>
        <Link
          href="/dashboard/home"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
