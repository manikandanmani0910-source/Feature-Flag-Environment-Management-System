import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  PageHeader,
} from "../../components/common/PageHeader";

import {
  apiClient,
} from "../../services/api/client";

import {
  endpoints,
} from "../../services/api/endpoints";

import {
  getErrorMessage,
} from "../../utils/errorHandler";


interface Environment {
  id: number | string;
  name: string;
  description?: string | null;
  is_active?: boolean;
}


interface EnvironmentResponse {
  items?: Environment[];
  data?: Environment[];
  environments?: Environment[];
}


function normalizeEnvironments(
  response: unknown,
): Environment[] {
  if (Array.isArray(response)) {
    return response as Environment[];
  }

  if (
    response &&
    typeof response === "object"
  ) {
    const data =
      response as Record<
        string,
        unknown
      >;

    if (
      Array.isArray(data.items)
    ) {
      return data.items as Environment[];
    }

    if (
      Array.isArray(data.data)
    ) {
      return data.data as Environment[];
    }

    if (
      Array.isArray(
        data.environments,
      )
    ) {
      return data.environments as Environment[];
    }
  }

  return [];
}


export function CreateFeatureFlagPage() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [key, setKey] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [environmentId, setEnvironmentId] =
    useState("");

  const [enabled, setEnabled] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* =======================================================
     ENVIRONMENTS
     ======================================================= */

  const {
    data: environments = [],
    isLoading: environmentsLoading,
  } = useQuery({
    queryKey: ["environments-for-feature-flag"],

    queryFn: async () => {
      const response =
        await apiClient.get<
          EnvironmentResponse
        >(
          endpoints.environments.list,
        );

      return normalizeEnvironments(
        response.data,
      );
    },
  });


  /* =======================================================
     CREATE FEATURE FLAG
     ======================================================= */

  const createMutation =
    useMutation({
      mutationFn: async () => {
        setErrorMessage("");

        const payload: Record<
          string,
          unknown
        > = {
          name: name.trim(),
          key: key.trim(),
          description:
            description.trim() ||
            null,
          enabled,
        };

        /*
         * Send environment only when
         * selected.
         */
        if (environmentId) {
          payload.environment_id =
            Number(environmentId);
        }

        const response =
          await apiClient.post(
            endpoints.featureFlags.create,
            payload,
          );

        return response.data;
      },

      onSuccess: () => {
        navigate(
          "/feature-flags",
          {
            replace: true,
          },
        );
      },

      onError: (error) => {
        setErrorMessage(
          getErrorMessage(error),
        );
      },
    });


  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage(
        "Feature name is required.",
      );
      return;
    }

    if (!key.trim()) {
      setErrorMessage(
        "Feature key is required.",
      );
      return;
    }

    createMutation.mutate();
  };


  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
          ================================================= */}

      <PageHeader
        title="Create Feature Flag"
        description="Create a new feature flag for your application."
        actions={
          <button
            type="button"
            onClick={() =>
              navigate(
                "/feature-flags",
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Back
          </button>
        }
      />


      {/* =================================================
          FORM
          ================================================= */}

      <div className="mx-auto w-full max-w-3xl">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              BASIC INFORMATION
              ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-base font-bold text-slate-900">
                Basic information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Define the name and identifier for
                this feature flag.
              </p>

            </div>


            {/* NAME */}

            <div className="space-y-2">

              <label
                htmlFor="feature-name"
                className="text-sm font-semibold text-slate-700"
              >
                Feature name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="feature-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="New Checkout Experience"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                required
              />

            </div>


            {/* KEY */}

            <div className="mt-5 space-y-2">

              <label
                htmlFor="feature-key"
                className="text-sm font-semibold text-slate-700"
              >
                Feature key
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="feature-key"
                value={key}
                onChange={(event) =>
                  setKey(
                    event.target.value,
                  )
                }
                placeholder="new_checkout"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                required
              />

              <p className="text-xs text-slate-400">
                Use a unique key that your application
                can use when evaluating the feature.
              </p>

            </div>


            {/* DESCRIPTION */}

            <div className="mt-5 space-y-2">

              <label
                htmlFor="feature-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="feature-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Describe what this feature controls..."
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

            </div>

          </div>


          {/* =================================================
              CONFIGURATION
              ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-base font-bold text-slate-900">
                Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the initial state and environment.
              </p>

            </div>


            {/* ENVIRONMENT */}

            <div className="space-y-2">

              <label
                htmlFor="environment"
                className="text-sm font-semibold text-slate-700"
              >
                Environment
              </label>

              <select
                id="environment"
                value={environmentId}
                onChange={(event) =>
                  setEnvironmentId(
                    event.target.value,
                  )
                }
                disabled={
                  environmentsLoading
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              >

                <option value="">
                  Select environment
                </option>

                {environments.map(
                  (environment) => (
                    <option
                      key={
                        environment.id
                      }
                      value={
                        environment.id
                      }
                    >
                      {environment.name}
                    </option>
                  ),
                )}

              </select>

            </div>


            {/* ENABLED */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <label className="flex cursor-pointer items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Enable feature
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Start this feature in the enabled
                    state.
                  </p>

                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() =>
                    setEnabled(
                      (current) =>
                        !current,
                    )
                  }
                  className={[
                    "relative h-6 w-11 rounded-full transition",
                    enabled
                      ? "bg-[#701A4D]"
                      : "bg-slate-300",
                  ].join(" ")}
                >

                  <span
                    className={[
                      "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
                      enabled
                        ? "left-6"
                        : "left-1",
                    ].join(" ")}
                  />

                </button>

              </label>

            </div>

          </div>


          {/* =================================================
              ERROR
              ================================================= */}

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}


          {/* =================================================
              ACTIONS
              ================================================= */}

          <div className="flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/feature-flags",
                )
              }
              className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createMutation.isPending
              }
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#701A4D] px-5 text-sm font-semibold text-white transition hover:bg-[#5A163D] disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save className="h-4 w-4" />

              {createMutation.isPending
                ? "Creating..."
                : "Create feature flag"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateFeatureFlagPage;