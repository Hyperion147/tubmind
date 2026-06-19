import { DashboardIdeasPageView } from "@/features/ideas/components/dashboard-ideas-page-view";
import { getDashboardWorkspace } from "@/features/workspace/server/get-dashboard-workspace";
import { getCurrentSession } from "@/lib/auth";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function DashboardIdeasPage({ searchParams }: PageProps) {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const params = await searchParams;
    const workspace = await getDashboardWorkspace(session.profile.id);

    return (
        <DashboardIdeasPageView
            ideas={workspace.ideas}
            query={params.q?.trim() ?? ""}
        />
    );
}
