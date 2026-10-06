import {
  BarChart3,
} from "lucide-react";

export interface UsageChartPoint {
  label: string;
  value: number;
}

interface UsageChartProps {
  data: UsageChartPoint[];
  title?: string;
}

export function UsageChart({
  data,
  title = "Usage Activity",
}: UsageChartProps) {
  const maxValue = Math.max(
    ...data.map((item) => item.value),
    1,
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <BarChart3 className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Usage activity over time.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
          No usage data available.
        </div>
      ) : (
        <div className="flex h-56 items-end gap-3 overflow-x-auto">
          {data.map((item) => {
            const height =
              (item.value / maxValue) *
              100;

            return (
              <div
                key={item.label}
                className="flex min-w-[48px] flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-slate-600">
                  {item.value}
                </span>

                <div className="flex h-36 w-full items-end rounded-md bg-slate-50">
                  <div
                    className="w-full rounded-md bg-slate-800 transition-all"
                    style={{
                      height: `${Math.max(
                        height,
                        3,
                      )}%`,
                    }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>

                <span className="max-w-20 truncate text-[11px] text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}