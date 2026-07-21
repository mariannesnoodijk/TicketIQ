"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

import { clearLocalSessionData } from "@/lib/auth/client-logout";

type LogoutFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "method"> & {
  children: ReactNode;
};

/** Form POST naar /auth/logout — betrouwbaarder dan server action + redirect voor Supabase cookies. */
export function LogoutForm({ children, onSubmit, ...props }: LogoutFormProps) {
  return (
    <form
      action="/auth/logout"
      method="post"
      {...props}
      onSubmit={(event) => {
        clearLocalSessionData();
        onSubmit?.(event);
      }}
    >
      {children}
    </form>
  );
}
