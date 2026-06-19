"use client";

import Image from "next/image";
import { startTransition, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type GoogleLoginButtonProps = {
  next?: string;
};

export function GoogleLoginButton({
  next = "/",
}: GoogleLoginButtonProps) {
  const [pending, setPending] = useState(false);

  function handleLogin() {
    startTransition(async () => {
      setPending(true);

      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setPending(false);
        console.error(error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-border bg-background/92 px-5 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/35 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-card">
        <Image
          src="/google-g.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden="true"
        />
      </span>
      <span>{pending ? "Redirecting..." : "Continue with Google"}</span>
    </button>
  );
}
