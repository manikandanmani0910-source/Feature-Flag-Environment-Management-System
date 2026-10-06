import { useState } from "react";

import { Button } from "../common/Button";

export interface ScheduleFormValues {
  name: string;
  description: string;
  feature_flag_id: string;
  environment_id: string;
  start_at: string;
  end_at: string;
  enabled: boolean;
}

interface ScheduleFormProps {
  initialValues?: Partial<ScheduleFormValues>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    values: ScheduleFormValues,
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaults: ScheduleFormValues = {
  name: "",
  description: "",
  feature_flag_id: "",
  environment_id: "",
  start_at: "",
  end_at: "",
  enabled: true,
};

export function ScheduleForm({
  initialValues,
  loading = false,
  submitLabel = "Save schedule",
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [form, setForm] =
    useState<ScheduleFormValues>({
      ...defaults,
      ...initialValues,
    });

  const updateField = <
    K extends keyof ScheduleFormValues,
  >(
    field: K,
    value: ScheduleFormValues[K],
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
          Schedule Configuration
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Configure when a feature flag should be active.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Schedule name"
          value={form.name}
          required
          placeholder="Production rollout"
          onChange={(value) =>
            updateField("name", value)
          }
        />

        <Field
          label="Feature Flag ID"
          value={form.feature_flag_id}
          type="number"
          required
          placeholder="1"
          onChange={(value) =>
            updateField(
              "feature_flag_id",
              value,
            )
          }
        />

        <Field
          label="Environment ID"
          value={form.environment_id}
          type="number"
          required
          placeholder="1"
          onChange={(value) =>
            updateField(
              "environment_id",
              value,
            )
          }
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Status
          </label>

          <label className="flex h-10 cursor-pointer items-center gap-3">
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

            <span className="text-sm text-slate-600">
              Schedule enabled
            </span>
          </label>
        </div>

        <DateTimeField
          label="Start time"
          value={form.start_at}
          onChange={(value) =>
            updateField(
              "start_at",
              value,
            )
          }
        />

        <DateTimeField
          label="End time"
          value={form.end_at}
          onChange={(value) =>
            updateField(
              "end_at",
              value,
            )
          }
        />

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value,
              )
            }
            rows={4}
            placeholder="Describe this schedule..."
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
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
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
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
        placeholder={placeholder}
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

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="datetime-local"
        value={value}
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