import {
  ArrowLeft,
  Edit,
  RefreshCw,
  ToggleLeft,
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
  useFeatureFlag,
} from "../../hooks/useFeatureFlags";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

import {
  formatDate,
} from "../../utils/formatters";

export function FeatureFlagDetailsPage() {
  const navigate = useNavigate();

  const { id } =
    useParams<{
      id: string;
    }>();

  const featureFlagId =
    Number(id);

  const {
    data: feature,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFeatureFlag(
    featureFlagId,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading feature flag..."
        />
      </div>
    );
  }

  if (isError || !feature) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Feature Flag"
          description="View feature flag configuration."
        />

        <ErrorState
          title="Unable to load feature flag"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const enabled =
    feature.enabled ??
    feature.is_enabled ??
    feature.is_active ??
    false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          feature.name ||
          "Feature Flag"
        }
        description="View feature flag configuration and status."
        actions={
          <div className="flex gap-2">
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

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/feature-flags/${feature.id}/edit`,
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </div>
        }
      />

      <button
        type="button"
        onClick={() =>
          navigate("/feature-flags")
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feature flags
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <ToggleLeft className="h-6 w-6 text-slate-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            {feature.name}
          </h2>

          <p className="mt-2 break-all font-mono text-sm text-slate-500">
            {feature.key}
          </p>

          <div className="mt-5">
            <StatusBadge
              status={
                enabled
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>
        </section>

        <section className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-bold text-slate-950">
              Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <Info
              label="Feature ID"
              value={`#${feature.id}`}
            />

            <Info
              label="Feature key"
              value={feature.key}
            />

            <Info
              label="Status"
              value={
                enabled
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <Info
              label="Created"
              value={formatDate(
                feature.created_at,
              )}
            />

            <Info
              label="Updated"
              value={formatDate(
                feature.updated_at,
              )}
            />

            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {feature.description ||
                  "No description provided."}
              </p>
            </div>
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