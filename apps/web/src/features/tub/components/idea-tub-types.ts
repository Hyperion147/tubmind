import {
  CalendarDays,
  Target,
} from "lucide-react";

import type { IdeaTubData, TubTaskStatus } from "@tubmind/domain/tub";

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

export const summaryIcons = {
  tasks: Target,
  date: CalendarDays,
} as const;
