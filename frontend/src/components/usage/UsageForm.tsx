import {
  useState,
} from "react";

import { Button } from "../common/Button";

export interface UsageFilterValues {
  feature_flag_id: string;
  environment_id: string;
  user_id: string;
  event_type: string;
}

interface UsageFormProps {
  initialValues?: Partial<UsageFilterValues>;
  onSubmit: (
    values: UsageFilterValues,
  ) => void;
  onReset?: () => void;
}

export function UsageForm({
  initialValues,
  onSubmit,
  onReset,
}: UsageFormProps) {
  const [form, setForm] =
    useState<UsageFilterValues>({
      feature_flag_id:
        initialValues?.feature_flag_id ??
        "",
      environment_id:
        initialValues?.environment_id ??
        "",
      user_id:
        initialValues?.user_id ?? "",
      event_type:
        initialValues?.event_type ?? "",
    });

  const updateField = (
    field: keyof UsageFilterValues,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onSubmit(form);
  };

  const handleReset = () => {
    setForm({
      feature_flag_id: "",
      environment_id: "",
      user_id: "",
      event_type: "",
    });

    onReset?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-sm font-bold text-slate-950">
          Usage Filters
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Filter usage activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Feature ID"
          value={
            form.feature_flag_id
          }
          onChange={(value) =>
            updateField(
              "feature_flag_id",
              value,
            )
          }
        />

        <Field
          label="Environment ID"
          value={
            form.environment_id
          }
          onChange={(value) =>
            updateField(
              "environment_id",
              value,
            )
          }
        />

        <Field
          label="User ID"
          value={form.user_id}
          onChange={(value) =>
            updateField(
              "user_id",
              value,
            )
          }
        />

        <Field
          label="Event Type"
          value={form.event_type}
          onChange={(value) =>
            updateField(
              "event_type",
              value,
            )
          }
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
        >
          Reset
        </Button>

        <Button type="submit">
          Apply Filters
        </Button>
      </div>
    </form>
  );
}

function Field({
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
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
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