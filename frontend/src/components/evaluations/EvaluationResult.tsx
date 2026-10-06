import {
  CheckCircle2,
  Clock,
  Database,
  XCircle,
} from "lucide-react";

import type { EvaluationResult as EvaluationResultType } from "../../types/evaluation";

interface EvaluationResultProps {
  result: EvaluationResultType | null;
}

export function EvaluationResult({
  result,
}: EvaluationResultProps) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No evaluation result
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Submit an evaluation to see the result here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Evaluation Result
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Result returned by the feature evaluation service.
          </p>
        </div>

        {result.enabled ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Enabled
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <XCircle className="h-4 w-4" />
            Disabled
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <ResultItem
          label="Feature"
          value={result.feature_key}
        />

        <ResultItem
          label="Environment"
          value={result.environment}
        />

        <ResultItem
          label="Reason"
          value={result.reason}
        />

        <ResultItem
          label="Source"
          value={result.source}
        />

        <ResultItem
          label="User"
          value={
            result.user_id != null
              ? `User #${result.user_id}`
              : "Anonymous"
          }
        />

        <ResultItem
          label="Rollout percentage"
          value={
            result.rollout_percentage !=
            null
              ? `${result.rollout_percentage}%`
              : "—"
          }
        />

        <ResultItem
          icon={
            <Database className="h-4 w-4" />
          }
          label="Cache"
          value={
            result.cached
              ? "Cached"
              : "Fresh evaluation"
          }
        />

        <ResultItem
          icon={
            <Clock className="h-4 w-4" />
          }
          label="Evaluated at"
          value={
            result.evaluated_at
              ? new Date(
                  result.evaluated_at,
                ).toLocaleString()
              : "—"
          }
        />
      </div>
    </div>
  );
}

function ResultItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}