import {
  PieChart,
} from "lucide-react";

interface RolloutData {
  label: string;
  percentage: number;
}

interface RolloutChartProps {
  data?: RolloutData[];
  title?: string;
}

export function RolloutChart({
  data = [],
  title = "Rollout Distribution",
}: RolloutChartProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature rollout distribution.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <PieChart className="h-5 w-5" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          No rollout data available.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map(
            (item, index) => (
              <div
                key={`${item.label}-${index}`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {item.percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-800 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          item.percentage,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}