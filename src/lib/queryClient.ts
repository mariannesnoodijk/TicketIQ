import { QueryClient } from "@tanstack/react-query";

/** Maakt een nieuwe QueryClient met de standaard projectinstellingen. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Geeft de QueryClient terug: op de server altijd een nieuwe, in de browser een singleton
 * zodat de cache tussen renders behouden blijft.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
