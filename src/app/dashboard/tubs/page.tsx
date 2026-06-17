import { TubPageClient } from "@/features/tub/components/tub-page-client";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";
import { getCurrentSession } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function DashboardTubsPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const params = await searchParams;
  const workspace = await getDashboardWorkspace(session.profile.id);

  return (
    <TubPageClient
      ideas={workspace.ideas}
      initialQuery={params.q?.trim() ?? ""}
    />
  );
}
