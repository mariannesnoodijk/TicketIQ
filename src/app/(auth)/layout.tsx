import type { ReactNode } from "react";

import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg flex min-h-full flex-1">
      <div className="auth-brand-panel hidden w-1/2 flex-col justify-between bg-brand-gradient p-10 text-white lg:flex">
        <p className="text-xl font-bold tracking-tight">TicketIQ</p>
        <div className="space-y-6">
          <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Sparkles className="size-8" aria-hidden="true" />
          </div>
          <blockquote className="space-y-3">
            <p className="text-3xl font-semibold leading-snug tracking-tight">
              Van tickets naar inzicht — met AI die meedenkt.
            </p>
            <p className="max-w-md text-base text-white/80">
              Analyseer patronen, ontdek trends en genereer helpcenter-artikelen op basis van
              echte supportdata.
            </p>
          </blockquote>
        </div>
        <p className="text-sm text-white/60">TicketIQ · AI supportanalyse</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="auth-form-enter w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
