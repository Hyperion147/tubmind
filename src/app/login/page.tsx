import type { Metadata } from "next";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { AuthRequiredPanel } from "@/features/auth/components/auth-required-panel";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access the Tubmind beta workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="grid gap-4 px-4 py-4 md:px-6 md:py-6">
      <SiteBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Login" },
        ]}
      />
      <AuthRequiredPanel
        title="Sign in to continue"
        description="Google sign-in keeps the beta workspace intentional: private drafting, calm collaboration, and a cleaner path back into your dashboard."
        next="/"
      />
    </div>
  );
}
