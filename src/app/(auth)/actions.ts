"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createTranslator } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/types";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function getLocaleFromFormData(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const locale = getLocaleFromFormData(formData);
  const t = createTranslator(locale);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard/home");

  if (!email || !password) {
    return { error: t("auth.errorEmailPasswordRequired") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard/home");
}

export async function register(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const locale = getLocaleFromFormData(formData);
  const t = createTranslator(locale);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!fullName) {
    return { error: t("auth.errorNameRequired") };
  }

  if (!email || !password) {
    return { error: t("auth.errorEmailPasswordRequired") };
  }

  if (password.length < 8) {
    return { error: t("auth.errorPasswordMinLength") };
  }

  if (password !== confirmPassword) {
    return { error: t("auth.errorPasswordMismatch") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteOrigin()}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      success: true,
      message: t("auth.registerSuccessEmailConfirm"),
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/home");
}
