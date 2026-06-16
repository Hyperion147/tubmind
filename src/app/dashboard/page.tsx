import { DashboardOverviewPage } from "@/features/dashboard/components/dashboard-overview-page";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";
import { getCurrentSession } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const workspace = await getDashboardWorkspace(session.profile.id);

    return (
        <DashboardOverviewPage
            displayName={session.profile.displayName}
            workspace={workspace}
        />
    );
}
