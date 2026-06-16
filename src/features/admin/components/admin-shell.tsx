import { ArrowRight, ShieldCheck } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { AdminSectionNav } from "@/features/admin/components/admin-section-nav";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/" },
  { label: "Listings", href: "/listings" },
  { label: "Admin", href: "/admin", matchPrefix: true },
];

export function AdminShell({
  userLabel,
  userAvatarUrl,
  children,
}: {
  userLabel: string;
  userAvatarUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-400 flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
        <SiteNavbar
          title="Admin"
          eyebrow="Tubmind"
          icon={ShieldCheck}
          navItems={navItems}
          activeHref="/admin"
          userLabel={userLabel}
          userAvatarUrl={userAvatarUrl}
          actions={[{ label: "Open dashboard", href: "/", icon: ArrowRight }]}
        />
        <AdminSectionNav />
        {children}
      </div>
    </main>
  );
}
