import {
  CalendarPlus,
  RefreshCw,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { SearchInput } from "../../components/common/SearchInput";
import { StatusBadge } from "../../components/common/StatusBadge";

import { useSchedules } from "../../hooks/useSchedules";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

import {
  formatDate,
} from "../../utils/formatters";


export function SchedulesPage() {
  const navigate = useNavigate();

  const {
    data: rawSchedules,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSchedules();


  /* =======================================================
     NORMALIZE API RESPONSE
     ======================================================= */

  const schedules = useMemo(() => {
    const response =
      rawSchedules as unknown;

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      typeof response === "object"
    ) {
      const objectResponse =
        response as Record<
          string,
          unknown
        >;

      if (
        Array.isArray(
          objectResponse.items,
        )
      ) {
        return objectResponse.items;
      }

      if (
        Array.isArray(
          objectResponse.data,
        )
      ) {
        return objectResponse.data;
      }

      if (
        Array.isArray(
          objectResponse.results,
        )
      ) {
        return objectResponse.results;
      }

      if (
        Array.isArray(
          objectResponse.schedules,
        )
      ) {
        return objectResponse.schedules;
      }

      if (
        Array.isArray(
          objectResponse.feature_schedules,
        )
      ) {
        return objectResponse.feature_schedules;
      }
    }

    return [];
  }, [rawSchedules]);


  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredSchedules =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return schedules.filter(
        (schedule) => {
          const item =
            schedule as {
              id?: unknown;
              feature_flag_id?: unknown;
              environment_id?: unknown;
              status?: unknown;
            };

          const scheduleStatus =
            String(
              item.status ?? "",
            ).toLowerCase();


          /* STATUS */

          if (
            status !== "all" &&
            scheduleStatus !==
              status.toLowerCase()
          ) {
            return false;
          }


          /* SEARCH */

          if (!value) {
            return true;
          }

          return [
            item.id,
            item.feature_flag_id,
            item.environment_id,
            item.status,
          ]
            .filter(
              (field) =>
                field !==
                  undefined &&
                field !== null,
            )
            .some((field) =>
              String(field)
                .toLowerCase()
                .includes(value),
            );
        },
      );
    }, [
      schedules,
      search,
      status,
    ]);


  /* =======================================================
     LOADING
     ======================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading schedules..."
        />
      </div>
    );
  }


  /* =======================================================
     ERROR
     ======================================================= */

  if (isError) {
    return (
      <div className="space-y-6">

        <PageHeader
          title="Schedules"
          description="Manage scheduled feature flag changes."
        />

        <ErrorState
          title="Unable to load schedules"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />

      </div>
    );
  }


  /* =======================================================
     COUNTS
     ======================================================= */

  const scheduledCount =
    schedules.filter(
      (schedule) => {
        const item =
          schedule as {
            status?: unknown;
          };

        return (
          String(item.status)
            .toUpperCase() ===
          "SCHEDULED"
        );
      },
    ).length;


  const activeCount =
    schedules.filter(
      (schedule) => {
        const item =
          schedule as {
            status?: unknown;
          };

        return (
          String(item.status)
            .toUpperCase() ===
          "ACTIVE"
        );
      },
    ).length;


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title="Schedules"
        description="Manage scheduled feature flag changes."
        actions={
          <div className="flex items-center gap-2">

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  isFetching
                    ? "animate-spin"
                    : "",
                ].join(" ")}
              />

              Refresh
            </button>


            {/* CREATE */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/schedules/new",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <CalendarPlus className="h-4 w-4" />

              Create schedule
            </button>

          </div>
        }
      />


      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total schedules
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {schedules.length}
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Scheduled
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {scheduledCount}
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {activeCount}
          </p>

        </div>

      </div>


      {/* ===================================================
          TABLE
          =================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">

          <div className="flex-1">

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search schedules..."
            />

          </div>


          {/* STATUS */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >

            <option value="all">
              All statuses
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50 text-left">

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feature Flag
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Environment
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {filteredSchedules.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No schedules found.
                  </td>

                </tr>

              ) : (

                filteredSchedules.map(
                  (schedule) => {
                    const item =
                      schedule as {
                        id:
                          | string
                          | number;
                        feature_flag_id?:
                          | string
                          | number;
                        environment_id?:
                          | string
                          | number;
                        status?:
                          | string
                          | null;
                        start_time?:
                          | string
                          | null;
                        end_time?:
                          | string
                          | null;
                      };


                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* SCHEDULE */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-900">
                            Schedule #{item.id}
                          </p>

                        </td>


                        {/* FEATURE */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">
                            Feature #
                            {item.feature_flag_id ??
                              "-"}
                          </span>

                        </td>


                        {/* ENVIRONMENT */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">
                            Environment #
                            {item.environment_id ??
                              "-"}
                          </span>

                        </td>


                        {/* START */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">
                            {item.start_time
                              ? formatDate(
                                  item.start_time,
                                )
                              : "-"}
                          </span>

                        </td>


                        {/* END */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">
                            {item.end_time
                              ? formatDate(
                                  item.end_time,
                                )
                              : "-"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              item.status ??
                              "Unknown"
                            }
                          />

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/schedules/${item.id}`,
                              )
                            }
                            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  },
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}