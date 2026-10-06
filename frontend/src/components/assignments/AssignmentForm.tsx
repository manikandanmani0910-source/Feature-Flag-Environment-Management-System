import { Save } from "lucide-react";
import { useState } from "react";

interface AssignmentFormProps {
  initialValues?: {
    feature_flag_id?: number | string;
    environment_id?: number | string;
    user_id?: number | string;
    enabled?: boolean;
  };
  loading?: boolean;
  onSubmit?: (values: {
    feature_flag_id: string;
    environment_id: string;
    user_id: string;
    enabled: boolean;
  }) => void;
  onCancel?: () => void;
}

export function AssignmentForm({
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
}: AssignmentFormProps) {
  const [featureFlagId, setFeatureFlagId] =
    useState(
      initialValues?.feature_flag_id != null
        ? String(initialValues.feature_flag_id)
        : "",
    );

  const [environmentId, setEnvironmentId] =
    useState(
      initialValues?.environment_id != null
        ? String(initialValues.environment_id)
        : "",
    );

  const [userId, setUserId] =
    useState(
      initialValues?.user_id != null
        ? String(initialValues.user_id)
        : "",
    );

  const [enabled, setEnabled] =
    useState(
      initialValues?.enabled ?? true,
    );

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onSubmit?.({
      feature_flag_id: featureFlagId,
      environment_id: environmentId,
      user_id: userId,
      enabled,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-sm font-bold text-slate-950">
          Assignment
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Configure a feature assignment for a user
          and environment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Feature Flag ID
          </label>

          <input
            type="number"
            value={featureFlagId}
            onChange={(event) =>
              setFeatureFlagId(
                event.target.value,
              )
            }
            required
            min={1}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Environment ID
          </label>

          <input
            type="number"
            value={environmentId}
            onChange={(event) =>
              setEnvironmentId(
                event.target.value,
              )
            }
            required
            min={1}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            User ID
          </label>

          <input
            type="number"
            value={userId}
            onChange={(event) =>
              setUserId(
                event.target.value,
              )
            }
            required
            min={1}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) =>
                setEnabled(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-700">
                Assignment enabled
              </span>

              <span className="block text-xs text-slate-400">
                Enable this feature for the selected user.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {loading
            ? "Saving..."
            : "Save assignment"}
        </button>
      </div>
    </form>
  );
}