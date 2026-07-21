"use client";

import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { logoutDueToInactivity } from "@/lib/auth/client-logout";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

/** Bewaakt idle-timeout in de app-shell; toont waarschuwing vóór automatische logout. */
export function SessionTimeoutGuard() {
  const { t } = useLocale();
  const { warningOpen, secondsRemaining, staySignedIn } = useIdleTimeout({
    onTimeout: () => {
      void logoutDueToInactivity();
    },
  });

  if (!warningOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
    >
      <div className="surface-card w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2
          id="session-timeout-title"
          className="text-lg font-semibold tracking-tight"
        >
          {t("auth.sessionTimeoutTitle")}
        </h2>
        <p
          id="session-timeout-desc"
          className="mt-2 text-sm text-muted-foreground"
        >
          {t("auth.sessionTimeoutDescription", { seconds: secondsRemaining })}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => void logoutDueToInactivity()}>
            {t("auth.logout")}
          </Button>
          <Button type="button" onClick={staySignedIn}>
            {t("auth.sessionTimeoutStay")}
          </Button>
        </div>
      </div>
    </div>
  );
}
