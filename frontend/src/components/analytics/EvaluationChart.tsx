import {
  Activity,
} from "lucide-react";

interface EvaluationPoint {
  label: string;
  value: number;
}

interface EvaluationChartProps {
  data?: EvaluationPoint[];
  title?: string;
}

export function EvaluationChart({
  data = [],
  title = "Evaluations",
}: EvaluationChartProps) {
  const max =
    Math.max(
      ...data.map(
        (item) => item.value,
      ),
      1,
    );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Evaluation activity over time.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          No evaluation data available.
        </div>
      ) : (
        <div className="flex h-48 items-end gap-2 overflow-x-auto">
          {data.map(
            (item, index) => {
              const height =
                Math.max(
                  (item.value /
                    max) *
                    100,
                  4,
                );

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] font-semibold text-slate-500">
                    {item.value}
                  </span>

                  <div
                    className="w-full rounded-t-md bg-slate-800 transition hover:bg-slate-700"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span className="max-w-14 truncate text-[10px] text-slate-400">
                    {item.label}
                  </span>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}