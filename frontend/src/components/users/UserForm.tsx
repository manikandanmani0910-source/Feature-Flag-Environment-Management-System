import { useState } from "react";

import { Button } from "../common/Button";

export interface UserFormValues {
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (
    values: UserFormValues,
  ) => void | Promise<void>;
}

export function UserForm({
  initialValues,
  submitLabel = "Save User",
  loading = false,
  onSubmit,
}: UserFormProps) {
  const [form, setForm] =
    useState<UserFormValues>({
      username:
        initialValues?.username ?? "",
      email:
        initialValues?.email ?? "",
      full_name:
        initialValues?.full_name ?? "",
      role_id:
        initialValues?.role_id ?? "",
      is_active:
        initialValues?.is_active ?? true,
      is_superuser:
        initialValues?.is_superuser ??
        false,
    });

  const updateField = (
    field: keyof UserFormValues,
    value: string | boolean,
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
          User Information
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Enter the user's account and access details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Field
          label="Username"
          value={form.username}
          required
          onChange={(value) =>
            updateField("username", value)
          }
        />

        <Field
          label="Email"
          type="email"
          value={form.email}
          required
          onChange={(value) =>
            updateField("email", value)
          }
        />

        <Field
          label="Full name"
          value={form.full_name}
          required
          onChange={(value) =>
            updateField("full_name", value)
          }
        />

        <Field
          label="Role ID"
          type="number"
          value={form.role_id}
          onChange={(value) =>
            updateField("role_id", value)
          }
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Account Status
          </label>

          <button
            type="button"
            role="switch"
            aria-checked={form.is_active}
            onClick={() =>
              updateField(
                "is_active",
                !form.is_active,
              )
            }
            className={[
              "relative h-6 w-11 rounded-full transition",
              form.is_active
                ? "bg-slate-900"
                : "bg-slate-300",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
                form.is_active
                  ? "left-6"
                  : "left-1",
              ].join(" ")}
            />
          </button>

          <p className="mt-1.5 text-xs text-slate-400">
            {form.is_active
              ? "User can access the platform."
              : "User account is inactive."}
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.is_superuser}
            onChange={(event) =>
              updateField(
                "is_superuser",
                event.target.checked,
              )
            }
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-700">
              Superuser access
            </span>

            <span className="mt-1 block text-xs text-slate-400">
              Grant administrative access.
            </span>
          </span>
        </label>
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
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
  onChange: (value: string) => void;
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
      />
    </div>
  );
}