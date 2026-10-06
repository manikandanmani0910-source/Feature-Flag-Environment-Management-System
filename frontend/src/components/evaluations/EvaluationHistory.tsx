import { Clock } from "lucide-react";

import type { EvaluationResult } from "../../types/evaluation";

interface EvaluationHistoryProps {
  evaluations: EvaluationResult[];
  loading?: boolean;
}

export function EvaluationHistory({
  evaluations,
  loading = false,
}: EvaluationHistoryProps) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />

          <h2 className="text-sm font-bold text-slate-950">
            Evaluation History
          </h2>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Recent feature evaluation results.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Environment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Result
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {evaluations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No evaluation history found.
                </td>
              </tr>
            ) : (
              evaluations.map(
                (evaluation, index) => (
                  <tr
                    key={`${evaluation.feature_key}-${evaluation.environment}-${evaluation.user_id ?? "anonymous"}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {evaluation.feature_key}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {evaluation.environment}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {evaluation.user_id !=
                      null
                        ? `User #${evaluation.user_id}`
                        : "Anonymous"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          evaluation.enabled
                            ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                        }
                      >
                        {evaluation.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                      <span className="line-clamp-2">
                        {evaluation.reason}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {evaluation.evaluated_at
                        ? new Date(
                            evaluation.evaluated_at,
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}