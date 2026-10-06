import {
  Activity,
  Flag,
  GitBranch,
  Server,
  Users,
} from "lucide-react";

import { StatCard } from "../common/StatCard";
import type { DashboardSummary } from "../../types/dashboard";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({
  summary,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Feature Flags"
        value={summary.features}
        icon={<Flag className="h-5 w-5" />}
      />

      <StatCard
        label="Environments"
        value={summary.environments}
        icon={<Server className="h-5 w-5" />}
      />

      <StatCard
        label="Rollouts"
        value={summary.rollouts}
        icon={<GitBranch className="h-5 w-5" />}
      />

      <StatCard
        label="Users"
        value={summary.users}
        icon={<Users className="h-5 w-5" />}
      />

      <StatCard
        label="Usage Events"
        value={summary.usage_events}
        icon={<Activity className="h-5 w-5" />}
      />
    </div>
  );
}