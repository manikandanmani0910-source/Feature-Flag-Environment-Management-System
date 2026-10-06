import {
  BarChart3,
  RefreshCw,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

import { useAnalytics } from "../../hooks/useAnalytics";

import { getErrorMessage } from "../../utils/errorHandler";

export function AnalyticsPage() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading analytics..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Analyze feature flag and environment activity."
        />

        <ErrorState
          title="Unable to load analytics"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const summary = data?.summary;

  const dailyUsage =
    data?.dailyUsage ?? [];

  const topFeatures =
    data?.topFeatures ?? [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Analytics"
        description="Analyze feature flag and environment activity."
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={
                isFetching
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>
        }
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Evaluations"
          value={
            summary?.total_evaluations ?? 0
          }
          icon={
            <Activity className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Enabled Evaluations"
          value={
            summary?.enabled_evaluations ?? 0
          }
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Disabled Evaluations"
          value={
            summary?.disabled_evaluations ?? 0
          }
          icon={
            <XCircle className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Unique Users"
          value={
            summary?.unique_users ?? 0
          }
          icon={
            <Users className="h-5 w-5" />
          }
        />
      </div>

      {/* SECONDARY SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Active Features"
          value={
            summary?.active_features ?? 0
          }
          icon={
            <BarChart3 className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Active Environments"
          value={
            summary?.active_environments ?? 0
          }
          icon={
            <BarChart3 className="h-5 w-5" />
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Adoption Rate
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {(
              summary?.adoption_rate ?? 0
            ).toFixed(2)}
            %
          </p>
        </div>
      </div>

      {/* TOP FEATURES */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-950">
            Top Features
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Most frequently evaluated feature flags.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feature
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Evaluations
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Enabled
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disabled
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unique Users
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {topFeatures.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No feature analytics available.
                  </td>
                </tr>
              ) : (
                topFeatures.map(
                  (feature) => (
                    <tr
                      key={
                        feature.feature_flag_id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {feature.name}
                        </p>

                        <p className="mt-1 font-mono text-xs text-slate-400">
                          {feature.key}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID:{" "}
                          {
                            feature.feature_flag_id
                          }
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {feature.evaluation_count.toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {feature.enabled_count.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {feature.disabled_count.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {feature.unique_users.toLocaleString(
                          "en-IN",
                        )}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DAILY USAGE */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-950">
            Daily Usage
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature evaluation activity by day.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Enabled
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disabled
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dailyUsage.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No daily usage data available.
                  </td>
                </tr>
              ) : (
                dailyUsage.map(
                  (usage) => (
                    <tr
                      key={usage.date}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {usage.date}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {usage.total.toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {usage.enabled.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {usage.disabled.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DATA SOURCE NOTE */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold text-slate-700">
          Analytics data
        </p>

        <p className="mt-1 text-xs text-slate-500">
          This page displays analytics returned
          directly from the configured backend API.
          No mock or hardcoded analytics data is used.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}