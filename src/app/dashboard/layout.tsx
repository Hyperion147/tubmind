import { AppProviders } from "@/components/providers/app-providers";
import { AuthRequiredPanel } from "@/features/auth/components/auth-required-panel";
import { DashboardShell } from "@/features/workspace/components/dashboard-shell";
import { getCurrentSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session || session.profile.status === "blocked") {
    return (
      <AuthRequiredPanel
        title={session?.profile.status === "blocked" ? "This workspace is locked" : "Sign in to open the dashboard"}
        description={
          session?.profile.status === "blocked"
            ? "This account is currently blocked from the workspace. If that looks wrong, ask an admin to review it."
            : "Projects, tasks, and your idea planning tools only open inside the authenticated workspace."
        }
        next="/dashboard"
      />
    );
  }

  return (
    <AppProviders>
      <DashboardShell
        user={{
          displayName: session.profile.displayName,
          avatarUrl: session.profile.avatarUrl,
          isAdmin: session.profile.role === "admin",
        }}
      >
        {children}
      </DashboardShell>
    </AppProviders>
  );
}
