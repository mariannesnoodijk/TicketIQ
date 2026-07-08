"use client";

/**
 * Auth-hook (placeholder).
 *
 * TODO (Deelopdracht 2): koppel aan Supabase Auth (sessie ophalen, login/logout,
 * en de ingelogde gebruiker teruggeven).
 */
export type AuthState = {
  user: null;
  loading: boolean;
};

export function useAuth(): AuthState {
  return { user: null, loading: false };
}
