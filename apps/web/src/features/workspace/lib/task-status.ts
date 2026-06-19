import {
  CheckCircle2,
  Clock3,
  Share2,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { TubTaskStatus } from "@tubmind/domain/tub";

export const taskStatusMeta: Record<
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
