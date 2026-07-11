import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <p className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            AI-gedreven supportanalyse
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Herken terugkerende ticketpatronen met TicketIQ
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Analyseer supporttickets, ontdek trends en genereer suggesties voor betere
            helpcenterartikelen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Start gratis
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Inloggen
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
