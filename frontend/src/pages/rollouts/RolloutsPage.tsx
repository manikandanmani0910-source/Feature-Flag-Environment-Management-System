import {
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { SearchInput } from "../../components/common/SearchInput";
import { StatusBadge } from "../../components/common/StatusBadge";

import { useRollouts } from "../../hooks/useRollouts";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function RolloutsPage() {
  const navigate = useNavigate();

  const {
    data: rollouts = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRollouts();

  const [search, setSearch] =
    useState("");

  const filteredRollouts =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return rollouts;
      }

      return rollouts.filter(
        (rollout) =>
          String(rollout.id)
            .toLowerCase()
            .includes(value) ||
          String(
            rollout.feature_flag_id,
          )
            .toLowerCase()
            .includes(value) ||
          String(
            rollout.environment_id,
          )
            .toLowerCase()
            .includes(value),
      );
    }, [rollouts, search]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading rollouts..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rollouts"
          description="Control feature availability and percentage-based distribution."
        />

        <ErrorState
          title="Unable to load rollouts"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const enabledCount =
    rollouts.filter(
      (rollout) =>
        rollout.is_enabled,
    ).length;

  const averagePercentage =
    rollouts.length > 0
      ? rollouts.reduce(
          (total, rollout) =>
            total +
            rollout.rollout_percentage,
          0,
        ) / rollouts.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rollouts"
        description="Control feature availability and percentage-based distribution."
        actions={
          <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/rollouts/new",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create rollout
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total rollouts
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {rollouts.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Enabled
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {enabledCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Average rollout
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {averagePercentage.toFixed(
              1,
            )}
            %
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by feature, environment or rollout ID..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rollout
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feature Flag
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Environment
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Distribution
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Targeting
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRollouts.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No rollouts found.
                  </td>
                </tr>
              ) : (
                filteredRollouts.map(
                  (rollout) => (
                    <tr
                      key={rollout.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Rollout #
                          {rollout.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Version{" "}
                          {rollout.version}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          Feature #
                          {
                            rollout.feature_flag_id
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          Environment #
                          {
                            rollout.environment_id
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-40">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Rollout
                            </span>

                            <span className="text-xs font-bold text-slate-900">
                              {
                                rollout.rollout_percentage
                              }
                              %
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-900"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    rollout.rollout_percentage,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            rollout.targeting_enabled
                              ? "Enabled"
                              : "Disabled"
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            rollout.is_enabled
                              ? "Enabled"
                              : "Disabled"
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/rollouts/${rollout.id}`,
                            )
                          }
                          className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredRollouts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {rollouts.length}
          </span>{" "}
          rollouts
        </div>
      </div>
    </div>
  );
}