import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardIdeaChildPage({ params }: PageProps) {
  const { id } = await params;

  redirect(`/dashboard/tubs/${id}`);
}
