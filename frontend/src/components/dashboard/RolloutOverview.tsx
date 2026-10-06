import {
  GitBranch,
} from "lucide-react";

import type { FeatureRollout } from "../../types/rollout";

interface RolloutOverviewProps {
  rollouts: FeatureRollout[];
}

export function RolloutOverview({
  rollouts,
}: RolloutOverviewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Active Rollouts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature rollout distribution
          </p>
        </div>

        <GitBranch className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-5 p-5">
        {rollouts.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No rollout configurations available.
          </p>
        ) : (
          rollouts
            .slice(0, 5)
            .map((rollout) => {
              const percentage =
                Math.max(
                  0,
                  Math.min(
                    100,
                    rollout.rollout_percentage,
                  ),
                );

              return (
                <div key={rollout.id}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          rollout.is_enabled
                            ? "bg-emerald-500"
                            : "bg-slate-300",
                        ].join(" ")}
                      />

                      <span className="text-sm font-medium text-slate-700">
                        Feature #{rollout.feature_flag_id}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {percentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Environment #
                    {rollout.environment_id}
                  </p>
                </div>
              );
            })
        )}
      </div>
    </section>
  );
}