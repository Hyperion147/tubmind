import { AuthModal } from "@/features/auth/components/auth-modal";

type AuthRequiredPanelProps = {
  title: string;
  description: string;
  next?: string;
};

export function AuthRequiredPanel({
  title,
  description,
  next = "/",
}: AuthRequiredPanelProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f4f4f5_42%,_#e4e4e7_100%)]">
      <div className="pointer-events-none mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-16 opacity-40 blur-[2px] md:px-10">
        <section className="border border-border/70 bg-card/80 p-10 shadow-sm">
          <div className="space-y-4">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Protected Area
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>
      </div>

      <AuthModal
        title={title}
        description={description}
        next={next}
        showClose={false}
      />
    </main>
  );
}
