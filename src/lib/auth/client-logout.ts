import { clearAgentChatMessages } from "@/lib/ai/chatStorage";
import { SESSION_EXPIRED_LOGIN_PATH } from "@/lib/auth/session-timeout";
import { createClient } from "@/lib/supabase/client";

/** Wist lokale chatstate vóór elke logout (form of programmatic). */
export function clearLocalSessionData() {
  clearAgentChatMessages();
}

/**
 * Client-side logout: wis chat, beëindig Supabase-sessie, redirect naar login.
 * Gebruikt bij idle timeout; handmatige logout blijft via POST /auth/logout.
 */
export async function logoutDueToInactivity() {
  clearLocalSessionData();

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[session-timeout] signOut failed:", error);
  }

  window.location.assign(SESSION_EXPIRED_LOGIN_PATH);
}
