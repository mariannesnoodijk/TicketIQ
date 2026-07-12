"use client";

import { logout } from "@/app/(auth)/actions";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations();

  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        {t("auth.logout")}
      </Button>
    </form>
  );
}
