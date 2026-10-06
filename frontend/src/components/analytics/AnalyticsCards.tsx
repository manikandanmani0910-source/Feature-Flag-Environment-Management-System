import {
  Activity,
  BarChart3,
  Globe,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "../common/StatCard";

interface AnalyticsCardsProps {
  totalFeatures: number;
  totalEnvironments: number;
  totalEvaluations: number;
  totalUsage: number;
}

export function AnalyticsCards({
  totalFeatures,
  totalEnvironments,
  totalEvaluations,
  totalUsage,
}: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Feature Flags"
        value={totalFeatures}
        icon={
          <BarChart3 className="h-5 w-5" />
        }
      />

      <StatCard
        label="Environments"
        value={totalEnvironments}
        icon={
          <Globe className="h-5 w-5" />
        }
      />

      <StatCard
        label="Evaluations"
        value={totalEvaluations}
        icon={
          <TrendingUp className="h-5 w-5" />
        }
      />

      <StatCard
        label="Usage"
        value={totalUsage}
        icon={
          <Activity className="h-5 w-5" />
        }
      />
    </div>
  );
}