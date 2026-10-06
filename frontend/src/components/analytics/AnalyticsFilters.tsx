import {
  CalendarDays,
  RotateCcw,
} from "lucide-react";

interface AnalyticsFiltersProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (
    value: string,
  ) => void;
  onEndDateChange?: (
    value: string,
  ) => void;
  onReset?: () => void;
}

export function AnalyticsFilters({
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  onReset,
}: AnalyticsFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Start date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                onStartDateChange?.(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            End date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                onEndDateChange?.(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}