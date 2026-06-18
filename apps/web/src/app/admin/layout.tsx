import type { Metadata } from "next";

import { DashboardShell } from "@/features/workspace/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <DashboardShell
      user={{
        displayName: session.profile.displayName,
        avatarUrl: session.profile.avatarUrl,
        isAdmin: true,
      }}
    >
      {children}
    </DashboardShell>
  );
}
