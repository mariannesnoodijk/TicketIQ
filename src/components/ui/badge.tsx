import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
        destructive: "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function statusBadgeVariant(
  status: string
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  switch (status) {
    case "open":
      return "default";
    case "pending":
      return "warning";
    case "closed":
      return "secondary";
    default:
      return "outline";
  }
}

export function priorityBadgeVariant(
  priority: string
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  switch (priority) {
    case "urgent":
    case "high":
      return "destructive";
    case "normal":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

export function suggestionStatusBadgeVariant(
  status: string
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "destructive";
    case "draft":
      return "secondary";
    default:
      return "outline";
  }
}

export function suggestionStatusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Goedgekeurd";
    case "pending":
      return "In afwachting";
    case "rejected":
      return "Afgewezen";
    case "draft":
      return "Concept";
    default:
      return status;
  }
}
