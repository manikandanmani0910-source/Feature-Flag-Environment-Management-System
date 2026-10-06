import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";

import {
  useEnvironment,
  useUpdateEnvironment,
} from "../../hooks/useEnvironments";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function EditEnvironmentPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const environmentId = Number(id);

  const {
    data: environment,
    isLoading,
    isError,
    error,
    refetch,
  } = useEnvironment(environmentId);

  const updateEnvironment =
    useUpdateEnvironment();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  useEffect(() => {
    if (!environment) {
      return;
    }

    setName(
      environment.name ?? "",
    );

    setDescription(
      environment.description ?? "",
    );

    setIsActive(
      environment.is_active ?? true,
    );
  }, [environment]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!environmentId || Number.isNaN(environmentId)) {
      return;
    }

    try {
      await updateEnvironment.mutateAsync({
        id: environmentId,
        payload: {
          name,
          description,
          is_active: isActive,
        },
      });

      navigate("/environments");
    } catch {
      // Mutation error is displayed below.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading environment..."
        />
      </div>
    );
  }

  if (isError || !environment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Environment"
          description="Update environment configuration."
          actions={
            <button
              type="button"
              onClick={() =>
                navigate("/environments")
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          }
        />

        <ErrorState
          title="Unable to load environment"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Environment"
        description={`Update configuration for ${environment.name}.`}
        actions={
          <button
            type="button"
            onClick={() =>
              navigate("/environments")
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {updateEnvironment.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(
            updateEnvironment.error,
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-950">
            Environment Configuration
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Update the environment name, description and status.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Environment name
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={name}
              required
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Active environment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Enable or disable this environment.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  setIsActive(
                    (current) =>
                      !current,
                  )
                }
                className={[
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  isActive
                    ? "bg-slate-900"
                    : "bg-slate-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
                    isActive
                      ? "left-6"
                      : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {isActive
                ? "This environment is active and available."
                : "This environment is inactive."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() =>
              navigate("/environments")
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              updateEnvironment.isPending
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {updateEnvironment.isPending
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}