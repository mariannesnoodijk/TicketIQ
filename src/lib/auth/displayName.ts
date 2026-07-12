/** Haalt weergavenaam uit Supabase user metadata. */
export function getUserDisplayName(
  userMetadata: Record<string, unknown> | undefined
): string | undefined {
  const fullName = userMetadata?.full_name;
  if (typeof fullName !== "string") {
    return undefined;
  }

  const trimmed = fullName.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
