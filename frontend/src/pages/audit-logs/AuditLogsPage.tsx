import {
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

import { useAuditLogs } from "../../hooks/useAuditLogs";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

import {
  formatDate,
  formatNumber,
} from "../../utils/formatters";


export function AuditLogsPage() {
  const {
    data: rawLogs,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAuditLogs();


  /* =======================================================
     NORMALIZE BACKEND RESPONSE
     ======================================================= */

  const logs = useMemo(() => {
    const response =
      rawLogs as unknown;

    /* Direct array */

    if (Array.isArray(response)) {
      return response;
    }


    /* Object response */

    if (
      response &&
      typeof response === "object"
    ) {
      const objectResponse =
        response as Record<
          string,
          unknown
        >;


      /* { items: [...] } */

      if (
        Array.isArray(
          objectResponse.items,
        )
      ) {
        return objectResponse.items;
      }


      /* { data: [...] } */

      if (
        Array.isArray(
          objectResponse.data,
        )
      ) {
        return objectResponse.data;
      }


      /* { results: [...] } */

      if (
        Array.isArray(
          objectResponse.results,
        )
      ) {
        return objectResponse.results;
      }


      /* { logs: [...] } */

      if (
        Array.isArray(
          objectResponse.logs,
        )
      ) {
        return objectResponse.logs;
      }


      /* { audit_logs: [...] } */

      if (
        Array.isArray(
          objectResponse.audit_logs,
        )
      ) {
        return objectResponse.audit_logs;
      }


      /* { auditLogs: [...] } */

      if (
        Array.isArray(
          objectResponse.auditLogs,
        )
      ) {
        return objectResponse.auditLogs;
      }


      /* { records: [...] } */

      if (
        Array.isArray(
          objectResponse.records,
        )
      ) {
        return objectResponse.records;
      }
    }


    return [];
  }, [rawLogs]);


  const [search, setSearch] =
    useState("");


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredLogs =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();


      if (!value) {
        return logs;
      }


      return logs.filter(
        (item) => {
          const log =
            item as {
              id?: unknown;
              action?: unknown;
              event_type?: unknown;
              resource_type?: unknown;
              resource_id?: unknown;
              user_id?: unknown;
              created_at?: unknown;
              timestamp?: unknown;
              logged_at?: unknown;
            };


          return [
            log.id,
            log.action,
            log.event_type,
            log.resource_type,
            log.resource_id,
            log.user_id,
            log.created_at,
            log.timestamp,
            log.logged_at,
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
      logs,
      search,
    ]);


  /* =======================================================
     SUMMARY
     ======================================================= */

  const totalEvents =
    logs.length;


  const resourcesAffected =
    new Set(
      logs
        .map((item) => {
          const log =
            item as {
              resource_type?: unknown;
              resource_id?: unknown;
            };

          return `${
            log.resource_type ?? ""
          }:${
            log.resource_id ?? ""
          }`;
        })
        .filter(
          (value) =>
            value !== ":",
        ),
    ).size;


  const usersInvolved =
    new Set(
      logs
        .map((item) => {
          const log =
            item as {
              user_id?: unknown;
            };

          return log.user_id;
        })
        .filter(
          (value) =>
            value !== undefined &&
            value !== null,
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
          label="Loading audit logs..."
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
          title="Audit Logs"
          description="Track changes and actions performed across the platform."
        />

        <ErrorState
          title="Unable to load audit logs"
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
        title="Audit Logs"
        description="Track changes and actions performed across the platform."
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


      {/* =================================================
          SUMMARY CARDS
          ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* TOTAL EVENTS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total events
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatNumber(
              totalEvents,
            )}
          </p>

        </div>


        {/* RESOURCES */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Resources affected
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatNumber(
              resourcesAffected,
            )}
          </p>

        </div>


        {/* USERS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Users involved
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatNumber(
              usersInvolved,
            )}
          </p>

        </div>

      </div>


      {/* =================================================
          AUDIT LOG TABLE
          ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="border-b border-slate-200 p-4">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search audit logs..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50 text-left">

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Event
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Resource
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Timestamp
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {filteredLogs.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No audit events found.
                  </td>

                </tr>

              ) : (

                filteredLogs.map(
                  (item) => {
                    const log =
                      item as {
                        id:
                          | string
                          | number;

                        action?:
                          | string
                          | null;

                        event_type?:
                          | string
                          | null;

                        resource_type?:
                          | string
                          | null;

                        resource_id?:
                          | string
                          | number
                          | null;

                        user_id?:
                          | string
                          | number
                          | null;

                        created_at?:
                          | string
                          | null
                          | undefined;

                        timestamp?:
                          | string
                          | null
                          | undefined;

                        logged_at?:
                          | string
                          | null
                          | undefined;
                      };


                    return (
                      <tr
                        key={log.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* EVENT */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-900">
                            Event #{log.id}
                          </p>

                          {log.event_type && (
                            <p className="mt-1 text-xs text-slate-400">
                              {log.event_type}
                            </p>
                          )}

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <span className="text-sm font-medium text-slate-700">
                            {log.action ||
                              "Platform action"}
                          </span>

                        </td>


                        {/* RESOURCE */}

                        <td className="px-5 py-4">

                          <p className="text-sm text-slate-600">
                            {log.resource_type ||
                              "—"}
                          </p>

                          {log.resource_id !=
                            null && (
                            <p className="mt-1 text-xs text-slate-400">
                              ID:{" "}
                              {log.resource_id}
                            </p>
                          )}

                        </td>


                        {/* USER */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">

                            {log.user_id !=
                            null
                              ? `User #${log.user_id}`
                              : "System"}

                          </span>

                        </td>


                        {/* TIMESTAMP */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-500">

                            {formatDate(
                              log.created_at ??
                                log.timestamp ??
                                log.logged_at,
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

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">

          Showing{" "}

          <span className="font-semibold text-slate-700">
            {formatNumber(
              filteredLogs.length,
            )}
          </span>

          {" "}of{" "}

          <span className="font-semibold text-slate-700">
            {formatNumber(
              logs.length,
            )}
          </span>

          {" "}audit events

        </div>

      </div>

    </div>
  );
}