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
import { useCreateUser } from "../../hooks/useUsers";
import { getErrorMessage } from "../../utils/errorHandler";

export function CreateUserPage() {
  const navigate = useNavigate();

  const createUser =
    useCreateUser();

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role_id: "",
    is_active: true,
    is_superuser: false,
  });

  const updateField = (
    field: string,
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

    try {
      await createUser.mutateAsync({
        email: form.email,
        full_name: form.full_name,
        password: form.password,
        role_id: form.role_id
          ? Number(form.role_id)
          : undefined,
        is_active: form.is_active,
      });

      navigate("/users");
    } catch {
      // Error is displayed below.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create User"
        description="Create a new platform user and configure account access."
        actions={
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </button>
        }
      />

      {createUser.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(
            createUser.error,
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-950">
            User Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Enter the account details for the new user.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <FormField
            label="Username"
            value={form.username}
            onChange={(value) =>
              updateField(
                "username",
                value,
              )
            }
            required
          />

          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) =>
              updateField(
                "email",
                value,
              )
            }
            required
          />

          <FormField
            label="Full name"
            value={form.full_name}
            onChange={(value) =>
              updateField(
                "full_name",
                value,
              )
            }
            required
          />

          <FormField
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) =>
              updateField(
                "password",
                value,
              )
            }
            required
          />

          <FormField
            label="Role ID"
            type="number"
            value={form.role_id}
            onChange={(value) =>
              updateField(
                "role_id",
                value,
              )
            }
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Account status
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={
                form.is_active
              }
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

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={
                  form.is_superuser
                }
                onChange={(event) =>
                  updateField(
                    "is_superuser",
                    event.target
                      .checked,
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  Superuser access
                </span>

                <span className="block text-xs text-slate-400">
                  Grant administrative access to the platform.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() =>
              navigate("/users")
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              createUser.isPending
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {createUser.isPending
              ? "Creating..."
              : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  required?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: FormFieldProps) {
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
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
    </div>
  );
}