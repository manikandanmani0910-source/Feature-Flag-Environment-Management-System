import { useEffect, useState } from "react";

import { Button } from "../common/Button";

export interface EnvironmentFormValues {
  name: string;
  key: string;
  description: string;
  is_active: boolean;
}

interface EnvironmentFormProps {
  initialValues?: Partial<EnvironmentFormValues>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    values: EnvironmentFormValues,
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaultValues: EnvironmentFormValues = {
  name: "",
  key: "",
  description: "",
  is_active: true,
};

export function EnvironmentForm({
  initialValues,
  loading = false,
  submitLabel = "Save environment",
  onSubmit,
  onCancel,
}: EnvironmentFormProps) {
  const [form, setForm] =
    useState<EnvironmentFormValues>({
      ...defaultValues,
      ...initialValues,
    });

  useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues]);

  const updateField = <
    K extends keyof EnvironmentFormValues,
  >(
    field: K,
    value: EnvironmentFormValues[K],
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
          Environment Information
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Configure the environment used by feature flags.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Name"
          value={form.name}
          required
          placeholder="Production"
          onChange={(value) =>
            updateField("name", value)
          }
        />

        <Field
          label="Key"
          value={form.key}
          required
          placeholder="production"
          onChange={(value) =>
            updateField(
              "key",
              value.toLowerCase().replace(
                /\s+/g,
                "_",
              ),
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
            placeholder="Describe this environment..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                updateField(
                  "is_active",
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-700">
                Active environment
              </span>

              <span className="block text-xs text-slate-400">
                Allow feature flags to be evaluated in this environment.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
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
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </div>
  );
}