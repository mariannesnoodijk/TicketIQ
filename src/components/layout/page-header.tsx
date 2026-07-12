import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  size?: "default" | "compact";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Terug",
  actions,
  size = "default",
  className,
}: PageHeaderProps) {
  const header = (
    <div className={cn("min-w-0 space-y-2", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 inline-flex")}
        >
          ← {backLabel}
        </Link>
      ) : null}
      <p className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h1
        className={cn(
          "text-balance font-semibold tracking-tight",
          size === "default" ? "text-3xl sm:text-4xl" : "text-2xl"
        )}
      >
        {title}
      </h1>
      {description ? <p className="max-w-2xl text-muted-foreground">{description}</p> : null}
    </div>
  );

  if (!actions) {
    return header;
  }

  return (
    <div className="flex items-start justify-between gap-4">
      {header}
      <div className="shrink-0">{actions}</div>
    </div>
  );
}
