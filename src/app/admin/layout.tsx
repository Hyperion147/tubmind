import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
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
    <AdminShell
      userLabel={session.profile.displayName}
      userAvatarUrl={session.profile.avatarUrl}
    >
      {children}
    </AdminShell>
  );
}
