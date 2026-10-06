import {
  Plus,
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

import { useEnvironments } from "../../hooks/useEnvironments";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function EnvironmentsPage() {
  const navigate = useNavigate();

  const {
    data: rawEnvironments,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useEnvironments();

  /*
   * Backend may return:
   *
   * 1. Direct array
   * [
   *   {...},
   *   {...}
   * ]
   *
   * 2. Paginated response
   * {
   *   items: [...]
   * }
   *
   * 3. Wrapped response
   * {
   *   data: [...]
   * }
   *
   * 4. Named response
   * {
   *   environments: [...]
   * }
   */

  const environments = useMemo(() => {
    const response =
      rawEnvironments as unknown;

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
          objectResponse.environments,
        )
      ) {
        return objectResponse.environments;
      }
    }

    return [];
  }, [rawEnvironments]);

  const [search, setSearch] =
    useState("");

  const filteredEnvironments =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return environments;
      }

      return environments.filter(
        (environment) => {
          const item =
            environment as {
              name?: unknown;
              description?: unknown;
            };

          return [
            item.name,
            item.description,
          ]
            .filter(Boolean)
            .some((field) =>
              String(field)
                .toLowerCase()
                .includes(value),
            );
        },
      );
    }, [environments, search]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading environments..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Environments"
          description="Manage deployment environments used by feature flags."
        />

        <ErrorState
          title="Unable to load environments"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const activeCount =
    environments.filter(
      (environment) => {
        const item =
          environment as {
            is_active?: unknown;
          };

        return Boolean(
          item.is_active,
        );
      },
    ).length;

  const inactiveCount =
    environments.length -
    activeCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environments"
        description="Manage deployment environments used by feature flags."
        actions={
          <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/environments/new",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Create environment
            </button>
          </div>
        }
      />

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total environments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {environments.length}
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

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* ENVIRONMENTS TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search environments..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Environment
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
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
              {filteredEnvironments.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No environments found.
                  </td>
                </tr>
              ) : (
                filteredEnvironments.map(
                  (environment) => {
                    const item =
                      environment as {
                        id:
                          | string
                          | number;
                        name?: string;
                        description?:
                          | string
                          | null;
                        is_active?:
                          | boolean
                          | null;
                      };

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* ENVIRONMENT */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name ??
                              "Unnamed environment"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: {item.id}
                          </p>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="max-w-md px-5 py-4">
                          <p className="truncate text-sm text-slate-600">
                            {item.description ||
                              "No description"}
                          </p>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              item.is_active
                                ? "Active"
                                : "Inactive"
                            }
                          />
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/environments/${item.id}`,
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

        {/* FOOTER */}
        <div className="border-t border-slate-200 px-5 py-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredEnvironments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {environments.length}
            </span>{" "}
            environments
          </p>
        </div>
      </div>
    </div>
  );
}