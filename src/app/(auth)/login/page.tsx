import { LoginForm } from "@/components/features/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? "/dashboard";

  return (
    <>
      {params.error === "auth_callback_failed" ? (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          Inloggen via de bevestigingslink is mislukt. Probeer opnieuw in te loggen.
        </p>
      ) : null}
      <LoginForm redirectTo={redirectTo} />
    </>
  );
}
