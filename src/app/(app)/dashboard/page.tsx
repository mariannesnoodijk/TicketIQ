import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { getUserDisplayName } from "@/lib/auth/displayName";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = getUserDisplayName(user?.user_metadata);

  return <DashboardContent displayName={displayName} />;
}
