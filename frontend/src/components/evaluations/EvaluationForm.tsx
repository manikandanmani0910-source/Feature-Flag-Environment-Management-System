import { useState } from "react";

import { Button } from "../common/Button";

export interface EvaluationFormValues {
  feature_key: string;
  environment: string;
  user_id: string;
}

interface EvaluationFormProps {
  loading?: boolean;
  initialValues?: Partial<EvaluationFormValues>;
  onSubmit: (
    values: EvaluationFormValues,
  ) => void | Promise<void>;
}

const defaultValues: EvaluationFormValues = {
  feature_key: "",
  environment: "",
  user_id: "",
};

export function EvaluationForm({
  loading = false,
  initialValues,
  onSubmit,
}: EvaluationFormProps) {
  const [form, setForm] =
    useState<EvaluationFormValues>({
      ...defaultValues,
      ...initialValues,
    });

  const updateField = <
    K extends keyof EvaluationFormValues,
  >(
    field: K,
    value: EvaluationFormValues[K],
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
          Evaluate Feature
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Evaluate a feature flag for a specific environment and user.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Feature key"
          value={form.feature_key}
          placeholder="new_checkout"
          required
          onChange={(value) =>
            updateField(
              "feature_key",
              value,
            )
          }
        />

        <Field
          label="Environment"
          value={form.environment}
          placeholder="production"
          required
          onChange={(value) =>
            updateField(
              "environment",
              value,
            )
          }
        />

        <Field
          label="User ID"
          type="number"
          value={form.user_id}
          placeholder="Optional"
          onChange={(value) =>
            updateField(
              "user_id",
              value,
            )
          }
        />
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Evaluating..."
            : "Evaluate feature"}
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
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </div>
  );
}