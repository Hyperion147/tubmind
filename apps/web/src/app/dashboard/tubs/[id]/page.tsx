import { notFound } from "next/navigation";

import { TubDetailPage } from "@/features/tub/components/tub-detail-page";
import { getTubDetailData } from "@/features/tub/server/tub-detail-data";
import { getCurrentSession } from "@/lib/auth";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardTubDetailPage({ params }: PageProps) {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const { id } = await params;
  const data = await getTubDetailData({
    ideaId: id,
    viewerId: session.profile.id,
    isAdmin: session.profile.role === "admin",
  });

  if (!data) {
    notFound();
  }

  return <TubDetailPage data={data} />;
}
