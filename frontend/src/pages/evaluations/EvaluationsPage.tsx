import {
  CheckCircle2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

import {
  useEvaluateFeature,
} from "../../hooks/useEvaluations";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

import type {
  EvaluationResult,
} from "../../types/evaluation";

export function EvaluationsPage() {
  const [featureKey, setFeatureKey] =
    useState("");

  const [environment, setEnvironment] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [result, setResult] =
    useState<EvaluationResult | null>(
      null,
    );

  const evaluateMutation =
    useEvaluateFeature();

  const handleEvaluate = () => {
    const trimmedFeature =
      featureKey.trim();

    const trimmedEnvironment =
      environment.trim();

    if (
      !trimmedFeature ||
      !trimmedEnvironment
    ) {
      return;
    }

    const numericUserId =
      userId.trim()
        ? Number(userId)
        : undefined;

    evaluateMutation.mutate(
      {
        feature_key:
          trimmedFeature,

        environment:
          trimmedEnvironment,

        ...(numericUserId !== undefined &&
        !Number.isNaN(numericUserId)
          ? {
              user_id:
                numericUserId,
            }
          : {}),
      },
      {
        onSuccess: (
          evaluation,
        ) => {
          setResult(evaluation);
        },
      },
    );
  };

  const handleClear = () => {
    setFeatureKey("");
    setEnvironment("");
    setUserId("");
    setResult(null);
    evaluateMutation.reset();
  };

  if (
    evaluateMutation.isPending &&
    !result
  ) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Evaluations"
          description="Evaluate feature flags against a specific environment and user."
        />

        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner
            size="lg"
            label="Evaluating feature..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Evaluations"
        description="Evaluate feature flags against a specific environment and user."
        actions={
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Clear
          </button>
        }
      />

      {/* EVALUATION FORM */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-950">
            Evaluate Feature
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Check whether a feature flag is enabled
            for a particular environment and user.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
          {/* FEATURE KEY */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Feature Key
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={featureKey}
                onChange={(event) =>
                  setFeatureKey(
                    event.target.value,
                  )
                }
                placeholder="e.g. dark_mode"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* ENVIRONMENT */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Environment
            </label>

            <input
              type="text"
              value={environment}
              onChange={(event) =>
                setEnvironment(
                  event.target.value,
                )
              }
              placeholder="e.g. production"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* USER ID */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              User ID
              <span className="ml-1 font-normal normal-case text-slate-400">
                (optional)
              </span>
            </label>

            <input
              type="number"
              value={userId}
              onChange={(event) =>
                setUserId(
                  event.target.value,
                )
              }
              placeholder="e.g. 101"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={
              evaluateMutation.isPending ||
              !featureKey.trim() ||
              !environment.trim()
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {evaluateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Evaluate
              </>
            )}
          </button>
        </div>
      </section>

      {/* ERROR */}
      {evaluateMutation.isError && (
        <ErrorState
          title="Evaluation failed"
          message={getErrorMessage(
            evaluateMutation.error,
          )}
          onRetry={handleEvaluate}
        />
      )}

      {/* RESULT */}
      {result && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Evaluation Result
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Result returned directly by the evaluation API.
              </p>
            </div>

            <div>
              {result.enabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                  <XCircle className="h-4 w-4" />
                  Disabled
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard
              label="Feature Key"
              value={
                result.feature_key ||
                "—"
              }
            />

            <ResultCard
              label="Environment"
              value={
                result.environment ||
                "—"
              }
            />

            <ResultCard
              label="User ID"
              value={
                result.user_id != null
                  ? String(
                      result.user_id,
                    )
                  : "Anonymous"
              }
            />

            <ResultCard
              label="Source"
              value={
                result.source || "—"
              }
            />

            <ResultCard
              label="Reason"
              value={
                result.reason || "—"
              }
            />

            <ResultCard
              label="Rollout"
              value={
                result.rollout_percentage !=
                null
                  ? `${result.rollout_percentage}%`
                  : "—"
              }
            />

            <ResultCard
              label="Cached"
              value={
                result.cached
                  ? "Yes"
                  : "No"
              }
            />

            <ResultCard
              label="Evaluated At"
              value={
                result.evaluated_at
                  ? new Date(
                      result.evaluated_at,
                    ).toLocaleString(
                      "en-IN",
                    )
                  : "—"
              }
            />
          </div>
        </section>
      )}

      {/* API INFORMATION */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold text-slate-700">
          Evaluation API
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          This page uses the configured evaluation
          endpoint to calculate the feature state in
          real time. The backend currently does not
          expose an evaluation-history endpoint, so
          previous evaluations are not displayed as a
          historical table.
        </p>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}