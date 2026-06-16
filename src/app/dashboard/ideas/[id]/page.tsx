import { DashboardIdeaDetailPage } from "@/features/workspace/components/dashboard-idea-detail-page";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardIdeaChildPage({ params }: PageProps) {
  const { id } = await params;

  return <DashboardIdeaDetailPage id={id} />;
}
