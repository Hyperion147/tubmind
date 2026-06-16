import type { ReactNode } from "react";

import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  user: {
    displayName: string;
    avatarUrl: string | null;
    isAdmin?: boolean;
  };
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen">
      <DashboardSidebar user={user} />
      <main className="min-w-0 md:pl-20">
        <div className="flex w-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
