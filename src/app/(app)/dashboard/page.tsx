import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardContent email={user?.email} />;
}
