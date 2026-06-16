import type { Metadata } from "next";

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
    <AuthRequiredPanel
        title="Sign in to continue"
        description="Google sign-in keeps the beta workspace intentional: private drafting, calm collaboration, and a cleaner path back into your dashboard."
        next="/"
      />
  );
}
