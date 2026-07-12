const DEFAULT_REDIRECT = "/dashboard/home";

/** Alleen relatieve interne paden; blokkeert open redirects (//evil.com, https://…). */
export function sanitizeRedirect(path: string, fallback = DEFAULT_REDIRECT): string {
  const trimmed = path.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }

  return trimmed;
}
