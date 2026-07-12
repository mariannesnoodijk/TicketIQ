"use client";

import { LogoutForm } from "@/components/features/auth/logout-form";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations();

  return (
    <LogoutForm>
      <Button type="submit" variant="outline" size="sm">
        {t("auth.logout")}
      </Button>
    </LogoutForm>
  );
}
