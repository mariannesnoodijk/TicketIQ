import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppLayoutShell } from "@/app/(app)/app-layout-shell";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/home");
  }

  return (
    <AppLayoutShell>
      <div className="flex min-h-full flex-1 flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </AppLayoutShell>
  );
}
