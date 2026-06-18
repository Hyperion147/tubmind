import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Share2,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { IdeaTubData, TubTaskStatus } from "@/lib/tub";

export type IdeaTubPageProps = {
  idea: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    status: string;
    visibility: string;
    updatedAt: string;
  };
  initialTubData: IdeaTubData;
};

export type TaskDraft = {
  title: string;
  description: string;
  deadline: string | null;
  status: TubTaskStatus;
  image: string | null;
};

export const statusMeta: Record<
  TubTaskStatus,
  {
    label: string;
    icon: LucideIcon;
    description: string;
  }
> = {
  planned: {
    label: "Planned",
    icon: Target,
    description: "Early tasks and incoming notes.",
  },
  ongoing: {
    label: "Ongoing",
    icon: Clock3,
    description: "Currently being worked through.",
  },
  shared: {
    label: "Shared",
    icon: Share2,
    description: "Ready to sync with collaborators.",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    description: "Wrapped and documented.",
  },
};

export const summaryIcons = {
  tasks: Target,
  date: CalendarDays,
} as const;
