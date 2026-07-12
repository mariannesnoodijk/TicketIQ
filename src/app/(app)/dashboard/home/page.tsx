import { HomePageContent } from "@/components/features/home/home-page-content";
import { getUserDisplayName } from "@/lib/auth/displayName";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = getUserDisplayName(user?.user_metadata);

  return <HomePageContent displayName={displayName} />;
}
