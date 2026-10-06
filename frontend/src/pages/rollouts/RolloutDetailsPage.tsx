import {
  ArrowLeft,
  RefreshCw,
  Rocket,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusBadge } from "../../components/common/StatusBadge";

import {
  useRollout,
} from "../../hooks/useRollouts";

import {
  getErrorMessage,
} from "../../utils/errorHandler";


export function RolloutDetailsPage() {
  const navigate = useNavigate();

  const { id } =
    useParams<{
      id: string;
    }>();

  const rolloutId =
    Number(id);

  const {
    data: rollout,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRollout(rolloutId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading rollout..."
        />
      </div>
    );
  }

  if (isError || !rollout) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rollout Details"
          description="View rollout configuration and deployment status."
        />

        <ErrorState
          title="Unable to load rollout"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Rollout #${rollout.id}`}
        description="View rollout configuration and deployment status."
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
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

      <button
        type="button"
        onClick={() =>
          navigate("/rollouts")
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to rollouts
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Rocket className="h-6 w-6 text-slate-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Rollout #{rollout.id}
          </h2>

          <div className="mt-4">
            <StatusBadge
              status={
                rollout.is_enabled
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rollout percentage
            </p>

            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
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

              <span className="text-sm font-bold text-slate-900">
                {rollout.rollout_percentage}%
              </span>
            </div>
          </div>
        </section>

        <section className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-bold text-slate-950">
              Rollout Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <Info
              label="Rollout ID"
              value={`#${rollout.id}`}
            />

            <Info
              label="Version"
              value={String(
                rollout.version,
              )}
            />

            <Info
              label="Feature Flag"
              value={`#${rollout.feature_flag_id}`}
            />

            <Info
              label="Environment"
              value={`#${rollout.environment_id}`}
            />

            <Info
              label="Percentage"
              value={`${rollout.rollout_percentage}%`}
            />

            <Info
              label="Targeting"
              value={
                rollout.targeting_enabled
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <Info
              label="Status"
              value={
                rollout.is_enabled
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}