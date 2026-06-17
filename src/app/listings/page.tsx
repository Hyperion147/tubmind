import { ArrowRight, Bath } from "lucide-react";

import { AppReveal } from "@/components/motion/app-reveal";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AuthGateOverlay } from "@/features/auth/components/auth-gate-overlay";
import { ListingCard } from "@/features/listing/card/listing-card";
import { ListingEmptyState } from "@/features/listing/components/listing-empty-state";
import { ListingFlowPanel } from "@/features/listing/components/listing-flow-panel";
import { ListingMobileSearchButton } from "@/features/listing/components/listing-mobile-search-button";
import { ListingSearchOptionsPanel } from "@/features/listing/components/listing-search-options-panel";
import { getListingsPageData } from "@/features/listing/lib/listing-queries";
import { getCurrentSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const [params, session] = await Promise.all([
    searchParams,
    getCurrentSession(),
  ]);
  const isAdmin = session?.profile.role === "admin";
  const isBlocked = session?.profile.status === "blocked";
  const isLocked = !session || isBlocked;
  const query = params.q?.trim() ?? "";
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const currentParams = new URLSearchParams();

  if (query) {
    currentParams.set("q", query);
  }
  if (page > 1) {
    currentParams.set("page", String(page));
  }

  const nextPath = currentParams.toString()
    ? `/listings?${currentParams.toString()}`
    : "/listings";

  const { listings, totalCount, totalPages } = await getListingsPageData({
    query,
    page,
    viewerId: session?.profile.id,
  });

  return (
    <AppProviders>
    <main className="relative min-h-screen">
      <div
        className={cn(
          "relative z-10 min-h-screen transition-[filter,opacity,transform] duration-500",
          isLocked &&
            "pointer-events-none scale-[0.998] select-none blur-[2px] opacity-70",
        )}
      >
        <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
          <div className="mx-auto w-full max-w-5xl">
            <AppReveal delay={0.1} y={-10} blur={10} duration={1}>
              <SiteNavbar
                title="Listings"
                icon={Bath}
                activeHref="/listings"
                userLabel={session?.profile.displayName}
                userAvatarUrl={session?.profile.avatarUrl}
                extraActions={
                  <ListingMobileSearchButton
                    query={query}
                    page={page}
                    totalCount={totalCount}
                    totalPages={totalPages}
                  />
                }
                actions={[
                  {
                    label: "Dashboard",
                    href: "/dashboard",
                    icon: ArrowRight,
                  },
                ]}
              />
            </AppReveal>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 z-40 px-4 md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mx-auto h-24 bg-linear-to-b from-background via-background/96 via-55% to-transparent" />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 pb-4 pt-28 md:px-6 md:pb-6 md:pt-32 xl:grid xl:grid-cols-[14rem_minmax(0,1fr)_14rem] xl:items-start xl:pt-28">
          <div className="grid min-h-0 gap-4 xl:col-span-3 xl:grid-cols-[14rem_minmax(0,1fr)_14rem] xl:items-start">
            <AppReveal
              inherit
              delay={0.18}
              y={18}
              blur={10}
              duration={1}
              className="order-1 w-full xl:h-full"
            >
              <div
                className="xl:fixed xl:top-28 xl:w-[16rem] xl:self-start"
                style={{ left: "calc(50% - 32rem)" }}
              >
                <ListingFlowPanel isAdmin={isAdmin} />
              </div>
            </AppReveal>

            <div className="order-3 min-h-0 xl:col-start-2">
              <AppReveal
                inherit
                delay={0.24}
                y={16}
                blur={10}
                duration={1}
                className="mx-auto w-full max-w-2xl"
              >
                <div className="grid gap-4">
                  <SiteBreadcrumb
                    items={[
                      { label: "Home", href: "/" },
                      { label: "Listings" },
                    ]}
                  />
                <div className="relative overflow-hidden rounded-none border border-border bg-card/70 shadow-xl backdrop-blur">
                  <div className="snap-y snap-mandatory space-y-4 p-4 pt-6">
                    {listings.length === 0 ? (
                      <ListingEmptyState />
                    ) : (
                      <section className="grid gap-2">
                        {listings.map((idea) => (
                          <ListingCard
                            key={idea.id}
                            idea={idea}
                            isAuthenticated={Boolean(session)}
                            nextPath={nextPath}
                          />
                        ))}
                      </section>
                    )}
                  </div>
                </div>
                </div>
              </AppReveal>
            </div>

            <AppReveal
              inherit
              delay={0.3}
              y={18}
              blur={10}
              duration={1}
              className="order-2 hidden w-full xl:block xl:h-full"
            >
              <div
                className="xl:fixed xl:top-28 xl:w-[16rem] xl:self-start"
                style={{ right: "calc(50% - 32rem)" }}
              >
                <ListingSearchOptionsPanel
                  query={query}
                  page={page}
                  totalCount={totalCount}
                  totalPages={totalPages}
                />
              </div>
            </AppReveal>
          </div>
        </div>
      </div>

      {isLocked ? (
        <AuthGateOverlay
          title={
            isBlocked
              ? "This listings board is locked"
              : "Sign in to browse listings"
          }
          description={
            isBlocked
              ? "This account is currently blocked from the beta workspace. If that looks wrong, review your account status with the admin who invited you."
              : "Listings, reactions, and deeper idea views stay behind sign-in so the product workspace remains intentional during the beta."
          }
          next={nextPath}
        />
      ) : null}
    </main>
    </AppProviders>
  );
}
