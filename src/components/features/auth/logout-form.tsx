"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

type LogoutFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "method"> & {
  children: ReactNode;
};

/** Form POST naar /auth/logout — betrouwbaarder dan server action + redirect voor Supabase cookies. */
export function LogoutForm({ children, ...props }: LogoutFormProps) {
  return (
    <form action="/auth/logout" method="post" {...props}>
      {children}
    </form>
  );
}
