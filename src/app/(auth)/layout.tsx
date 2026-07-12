import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";
import { AuthLocaleToggle } from "@/components/layout/auth-locale-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg flex min-h-full flex-1">
      <AuthLocaleToggle />
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="auth-form-enter w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
