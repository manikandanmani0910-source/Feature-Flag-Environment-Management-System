import { RefreshCw } from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

import { SummaryCards } from "../../components/dashboard/SummaryCards";
import { FeatureOverview } from "../../components/dashboard/FeatureOverview";
import { EnvironmentOverview } from "../../components/dashboard/EnvironmentOverview";
import { RolloutOverview } from "../../components/dashboard/RolloutOverview";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { ScheduleOverview } from "../../components/dashboard/ScheduleOverview";

import { useDashboard } from "../../hooks/useDashboard";
import { getErrorMessage } from "../../utils/errorHandler";

export function DashboardPage() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading dashboard..."
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Monitor feature flags, environments, rollouts and platform activity."
          actions={
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
        />

        <ErrorState
          title="Unable to load dashboard"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monitor feature flags, environments, rollouts and platform activity."
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "h-4 w-4",
                isFetching
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />
            Refresh
          </button>
        }
      />

      <SummaryCards summary={data.summary} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FeatureOverview
          features={data.features}
        />

        <EnvironmentOverview
          environments={data.environments}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RolloutOverview
          rollouts={data.rollouts}
        />

        <ScheduleOverview
          schedules={data.schedules}
        />
      </div>

      <RecentActivity
        activity={data.recent_activity}
      />
    </div>
  );
}