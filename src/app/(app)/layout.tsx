import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
