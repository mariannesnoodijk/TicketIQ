import { LoginForm } from "@/components/features/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/dashboard/home";

  return (
    <LoginForm
      redirectTo={redirectTo}
      authCallbackFailed={params.error === "auth_callback_failed"}
      sessionExpired={params.reason === "session_expired"}
    />
  );
}
