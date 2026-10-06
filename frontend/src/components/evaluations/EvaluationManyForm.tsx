import { useState } from "react";

import { Button } from "../common/Button";

export interface EvaluationManyFormValues {
  feature_key: string;
  environment: string;
  user_ids: string;
}

interface EvaluationManyFormProps {
  loading?: boolean;
  onSubmit: (
    values: EvaluationManyFormValues,
  ) => void | Promise<void>;
}

export function EvaluationManyForm({
  loading = false,
  onSubmit,
}: EvaluationManyFormProps) {
  const [form, setForm] =
    useState<EvaluationManyFormValues>({
      feature_key: "",
      environment: "",
      user_ids: "",
    });

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
          Batch Evaluation
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Evaluate the same feature for multiple users.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Feature key"
          value={form.feature_key}
          placeholder="new_checkout"
          required
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              feature_key: value,
            }))
          }
        />

        <Field
          label="Environment"
          value={form.environment}
          placeholder="production"
          required
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              environment: value,
            }))
          }
        />

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            User IDs
          </label>

          <textarea
            value={form.user_ids}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                user_ids:
                  event.target.value,
              }))
            }
            placeholder="101, 102, 103"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
          />

          <p className="mt-1.5 text-xs text-slate-400">
            Enter user IDs separated by commas.
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Evaluating..."
            : "Run batch evaluation"}
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
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
      />
    </div>
  );
}