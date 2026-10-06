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

import {
  useFeatureFlags,
} from "../../hooks/useFeatureFlags";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function FeatureFlagsPage() {
  const navigate = useNavigate();

  const {
    data: rawFeatureFlags,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFeatureFlags();

  /*
   * Backend can return:
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
   *   feature_flags: [...]
   * }
   */

  const featureFlags = useMemo(() => {
    const response =
      rawFeatureFlags as unknown;

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
          objectResponse.feature_flags,
        )
      ) {
        return objectResponse.feature_flags;
      }

      if (
        Array.isArray(
          objectResponse.featureFlags,
        )
      ) {
        return objectResponse.featureFlags;
      }
    }

    return [];
  }, [rawFeatureFlags]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "all" | "enabled" | "disabled"
    >("all");

  const filteredFeatureFlags =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return featureFlags.filter(
        (feature) => {
          const item =
            feature as {
              name?: unknown;
              key?: unknown;
              description?: unknown;
              enabled?: boolean | null;
              is_enabled?:
                | boolean
                | null;
              is_active?:
                | boolean
                | null;
            };

          const enabled =
            item.enabled ??
            item.is_enabled ??
            item.is_active ??
            false;

          /* STATUS FILTER */

          if (
            status === "enabled" &&
            !enabled
          ) {
            return false;
          }

          if (
            status === "disabled" &&
            enabled
          ) {
            return false;
          }

          /* SEARCH */

          if (!value) {
            return true;
          }

          return [
            item.name,
            item.key,
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
    }, [
      featureFlags,
      search,
      status,
    ]);

  /* LOADING */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading feature flags..."
        />
      </div>
    );
  }

  /* ERROR */

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Feature Flags"
          description="Manage application features and their availability."
        />

        <ErrorState
          title="Unable to load feature flags"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  /* ENABLED COUNT */

  const enabledCount =
    featureFlags.filter(
      (feature) => {
        const item =
          feature as {
            enabled?: boolean | null;
            is_enabled?:
              | boolean
              | null;
            is_active?:
              | boolean
              | null;
          };

        return Boolean(
          item.enabled ??
            item.is_enabled ??
            item.is_active ??
            false,
        );
      },
    ).length;

  const disabledCount =
    featureFlags.length -
    enabledCount;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title="Feature Flags"
        description="Manage application features and their availability."
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
                  "/feature-flags/new",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Create feature
            </button>

          </div>
        }
      />

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total features
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {featureFlags.length}
          </p>
        </div>

        {/* ENABLED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Enabled
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {enabledCount}
          </p>
        </div>

        {/* DISABLED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Disabled
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-500">
            {disabledCount}
          </p>
        </div>

      </div>

      {/* TABLE */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH + FILTER */}

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">

          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by feature name or key..."
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "all"
                  | "enabled"
                  | "disabled",
              )
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">
              All statuses
            </option>

            <option value="enabled">
              Enabled
            </option>

            <option value="disabled">
              Disabled
            </option>
          </select>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feature
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Key
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

              {filteredFeatureFlags.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No feature flags found.
                  </td>
                </tr>
              ) : (
                filteredFeatureFlags.map(
                  (feature) => {
                    const item =
                      feature as {
                        id:
                          | string
                          | number;
                        name?: string;
                        key?: string;
                        description?:
                          | string
                          | null;
                        enabled?:
                          | boolean
                          | null;
                        is_enabled?:
                          | boolean
                          | null;
                        is_active?:
                          | boolean
                          | null;
                      };

                    const enabled =
                      item.enabled ??
                      item.is_enabled ??
                      item.is_active ??
                      false;

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* FEATURE */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name ??
                              "Unnamed feature"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: {item.id}
                          </p>
                        </td>

                        {/* KEY */}

                        <td className="px-5 py-4">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                            {item.key ??
                              "-"}
                          </code>
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-sm px-5 py-4">
                          <p className="truncate text-sm text-slate-600">
                            {item.description ||
                              "No description"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              enabled
                                ? "Enabled"
                                : "Disabled"
                            }
                          />
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/feature-flags/${item.id}`,
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

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredFeatureFlags.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {featureFlags.length}
          </span>{" "}
          feature flags
        </div>

      </div>

    </div>
  );
}