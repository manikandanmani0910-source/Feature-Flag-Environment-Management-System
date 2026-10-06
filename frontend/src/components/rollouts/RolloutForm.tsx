import { useState } from "react";

import { Button } from "../common/Button";

import { PercentageControl } from "./PercentageControl";

export interface RolloutFormValues {
  feature_flag_id: string;
  environment_id: string;
  percentage: number;
  enabled: boolean;
}

interface RolloutFormProps {
  initialValues?: Partial<RolloutFormValues>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    values: RolloutFormValues,
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaults: RolloutFormValues = {
  feature_flag_id: "",
  environment_id: "",
  percentage: 0,
  enabled: true,
};

export function RolloutForm({
  initialValues,
  loading = false,
  submitLabel = "Save rollout",
  onSubmit,
  onCancel,
}: RolloutFormProps) {
  const [form, setForm] =
    useState<RolloutFormValues>({
      ...defaults,
      ...initialValues,
    });

  const updateField = <
    K extends keyof RolloutFormValues,
  >(
    field: K,
    value: RolloutFormValues[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-sm font-bold text-slate-950">
          Rollout Configuration
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Configure how much traffic receives this feature.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Feature Flag ID"
          type="number"
          value={form.feature_flag_id}
          required
          onChange={(value) =>
            updateField(
              "feature_flag_id",
              value,
            )
          }
        />

        <Field
          label="Environment ID"
          type="number"
          value={form.environment_id}
          required
          onChange={(value) =>
            updateField(
              "environment_id",
              value,
            )
          }
        />

        <div className="md:col-span-2">
          <PercentageControl
            value={form.percentage}
            disabled={loading}
            onChange={(value) =>
              updateField(
                "percentage",
                value,
              )
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                updateField(
                  "enabled",
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-700">
                Enable rollout
              </span>

              <span className="block text-xs text-slate-400">
                Apply this rollout configuration.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        min={type === "number" ? 1 : undefined}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
      />
    </div>
  );
}