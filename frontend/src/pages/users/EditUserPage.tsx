import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";

import {
  useUpdateUser,
  useUser,
} from "../../hooks/useUsers";

import {
  getErrorMessage,
} from "../../utils/errorHandler";

export function EditUserPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const userId = Number(id);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useUser(userId);

  const updateUser =
    useUpdateUser();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [isSuperuser, setIsSuperuser] =
    useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(
      user.full_name ??
        `${user.first_name ?? ""} ${
          user.last_name ?? ""
        }`.trim(),
    );

    setEmail(
      user.email ?? "",
    );

    setIsActive(
      user.is_active ?? true,
    );

    setIsSuperuser(
      user.is_superuser ?? false,
    );
  }, [user]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!userId || Number.isNaN(userId)) {
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: userId,
        payload: {
        email,
        full_name: fullName,
        is_active: isActive,
      },
      });

      navigate("/users");
    } catch {
      // Mutation error is displayed below.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Loading user..."
        />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit User"
          description="Update user account information."
          actions={
            <button
              type="button"
              onClick={() =>
                navigate("/users")
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          }
        />

        <ErrorState
          title="Unable to load user"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description="Update user account information and access."
        actions={
          <button
            type="button"
            onClick={() =>
              navigate("/users")
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {updateUser.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(
            updateUser.error,
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
            Update the user's account details and access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Full name
            </label>

            <input
              type="text"
              value={fullName}
              required
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              required
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              User ID
            </label>

            <input
              value={String(user.id)}
              disabled
              className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Account status
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() =>
                setIsActive(
                  (current) =>
                    !current,
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
                  "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
                  isActive
                    ? "left-6"
                    : "left-1",
                ].join(" ")}
              />
            </button>

            <p className="mt-1.5 text-xs text-slate-400">
              {isActive
                ? "User can access the platform."
                : "User account is inactive."}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isSuperuser}
                onChange={(event) =>
                  setIsSuperuser(
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  Superuser access
                </span>

                <span className="block text-xs text-slate-400">
                  Grant administrative access to this account.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
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
              updateUser.isPending
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {updateUser.isPending
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}