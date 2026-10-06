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

import { PageHeader } from "../../components/common/PageHeader";

import {
  useCreateEnvironment,
} from "../../hooks/useEnvironments";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function CreateEnvironmentPage() {
  const navigate = useNavigate();

  const createEnvironment =
    useCreateEnvironment();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      await createEnvironment.mutateAsync({
        name,
        description,
        is_active: isActive,
      });

      navigate("/environments");
    } catch {
      // Error displayed below.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Environment"
        description="Create a deployment environment for feature flag management."
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

      {createEnvironment.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(
            createEnvironment.error,
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
            Define the environment name, description and availability.
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
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              required
              placeholder="Production"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
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
              placeholder="Describe this environment..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Active environment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Allow this environment to be used by feature flags.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  setIsActive(
                    !isActive,
                  )
                }
                className={[
                  "relative h-6 w-11 rounded-full transition",
                  isActive
                    ? "bg-slate-900"
                    : "bg-slate-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 h-4 w-4 rounded-full bg-white transition",
                    isActive
                      ? "left-6"
                      : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>
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
              createEnvironment.isPending
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {createEnvironment.isPending
              ? "Creating..."
              : "Create environment"}
          </button>
        </div>
      </form>
    </div>
  );
}