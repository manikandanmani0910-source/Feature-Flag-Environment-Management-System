import {
  Activity,
  RefreshCw,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { SearchInput } from "../../components/common/SearchInput";

import { useUsage } from "../../hooks/useUsage";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

import {
  formatDate,
  formatNumber,
} from "../../utils/formatters";


export function UsagePage() {
  const {
    data: rawUsage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsage();


  /* =======================================================
     NORMALIZE BACKEND RESPONSE
     ======================================================= */

  const usage = useMemo(() => {
    const response =
      rawUsage as unknown;

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
          objectResponse.usage,
        )
      ) {
        return objectResponse.usage;
      }

      if (
        Array.isArray(
          objectResponse.feature_usage,
        )
      ) {
        return objectResponse.feature_usage;
      }

      if (
        Array.isArray(
          objectResponse.records,
        )
      ) {
        return objectResponse.records;
      }
    }

    return [];
  }, [rawUsage]);


  const [search, setSearch] =
    useState("");


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredUsage =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return usage;
      }

      return usage.filter(
        (item) => {
          const record =
            item as {
              id?: unknown;
              feature_flag_id?: unknown;
              environment_id?: unknown;
              user_id?: unknown;
              created_at?: unknown;
            };

          return [
            record.id,
            record.feature_flag_id,
            record.environment_id,
            record.user_id,
            record.created_at,
          ]
            .filter(
              (field) =>
                field !== undefined &&
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
      usage,
      search,
    ]);


  /* =======================================================
     SUMMARY
     ======================================================= */

  const totalEvents =
    usage.length;


  const uniqueUsers =
    new Set(
      usage
        .map((item) => {
          const record =
            item as {
              user_id?: unknown;
            };

          return record.user_id;
        })
        .filter(
          (id) =>
            id !== undefined &&
            id !== null,
        ),
    ).size;


  const uniqueFeatures =
    new Set(
      usage
        .map((item) => {
          const record =
            item as {
              feature_flag_id?: unknown;
            };

          return record.feature_flag_id;
        })
        .filter(
          (id) =>
            id !== undefined &&
            id !== null,
        ),
    ).size;


  const uniqueEnvironments =
    new Set(
      usage
        .map((item) => {
          const record =
            item as {
              environment_id?: unknown;
            };

          return record.environment_id;
        })
        .filter(
          (id) =>
            id !== undefined &&
            id !== null,
        ),
    ).size;


  /* =======================================================
     LOADING
     ======================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading usage data..."
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
          title="Usage"
          description="Monitor feature flag usage activity."
        />

        <ErrorState
          title="Unable to load usage data"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />

      </div>
    );
  }


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title="Usage"
        description="Monitor feature flag usage activity."
        actions={
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
        }
      />


      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          label="Total events"
          value={totalEvents}
          icon={
            <Activity className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Unique users"
          value={uniqueUsers}
          icon={
            <Activity className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Features used"
          value={uniqueFeatures}
          icon={
            <Activity className="h-5 w-5" />
          }
        />

        <MetricCard
          label="Environments"
          value={uniqueEnvironments}
          icon={
            <Activity className="h-5 w-5" />
          }
        />

      </div>


      {/* USAGE TABLE */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="border-b border-slate-200 p-4">

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search usage records..."
          />

        </div>


        {/* INFO */}

        <div className="border-b border-slate-200 px-5 py-3">

          <p className="text-xs text-slate-500">
            Usage records returned directly
            from the backend.
          </p>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50 text-left">

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Event
                </th>

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
                  Created At
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {filteredUsage.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <Activity className="h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        No usage records found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        No records match the current search.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredUsage.map(
                  (item) => {
                    const record =
                      item as {
                        id:
                          | string
                          | number;

                        feature_flag_id?:
                          | string
                          | number;

                        environment_id?:
                          | string
                          | number;

                        user_id?:
                          | string
                          | number
                          | null;

                        created_at?:
                          | string
                          | null
                          | undefined;
                      };


                    return (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* EVENT */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-900">
                            Event #{record.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Usage record
                          </p>

                        </td>


                        {/* FEATURE */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                            Feature #
                            {record.feature_flag_id ??
                              "-"}
                          </span>

                        </td>


                        {/* ENVIRONMENT */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                            Environment #
                            {record.environment_id ??
                              "-"}
                          </span>

                        </td>


                        {/* USER */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">

                            {record.user_id !=
                            null
                              ? `User #${record.user_id}`
                              : "Anonymous"}

                          </span>

                        </td>


                        {/* CREATED */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-500">

                            {formatDate(
                              record.created_at,
                            )}

                          </span>

                        </td>

                      </tr>
                    );
                  },
                )

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="border-t border-slate-200 px-5 py-3">

          <div className="flex items-center justify-between">

            <p className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-700">
                {formatNumber(
                  filteredUsage.length,
                )}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-slate-700">
                {formatNumber(
                  usage.length,
                )}
              </span>

              {" "}records

            </p>


            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Clear search
              </button>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}


/* ========================================================= */
/* METRIC CARD */
/* ========================================================= */

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {formatNumber(value)}
      </p>

    </div>
  );
}