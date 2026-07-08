import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Voegt Tailwind-classNames samen en lost class-conflicten correct op. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
