import {
  CalendarClock,
} from "lucide-react";

import {
  formatDate,
} from "../../utils/formatters";

import type {
  FeatureSchedule,
} from "../../types/schedule";

import { StatusBadge } from "../common/StatusBadge";

interface ScheduleOverviewProps {
  schedules: FeatureSchedule[];
}

export function ScheduleOverview({
  schedules,
}: ScheduleOverviewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Scheduled Changes
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Upcoming feature changes
          </p>
        </div>

        <CalendarClock className="h-5 w-5 text-slate-400" />
      </div>

      <div className="divide-y divide-slate-100">
        {schedules.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No scheduled changes.
          </div>
        ) : (
          schedules
            .slice(0, 5)
            .map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Feature #
                    {schedule.feature_flag_id}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Environment #
                    {schedule.environment_id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      schedule.start_time,
                    )}
                  </p>
                </div>

                <StatusBadge
                  status={schedule.status}
                />
              </div>
            ))
        )}
      </div>
    </section>
  );
}