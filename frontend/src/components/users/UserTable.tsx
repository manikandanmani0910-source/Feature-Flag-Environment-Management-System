import {
  Edit,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { AuthUser } from "../../types/auth";

interface UserTableProps {
  users: AuthUser[];
  onDelete?: (
    user: AuthUser,
  ) => void;
}

export function UserTable({
  users,
  onDelete,
}: UserTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Access
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const displayName =
                  user.full_name ||
                  user.email ||
                  `User #${user.id}`;

                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID #{user.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.email ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.role_id != null
                        ? `Role #${user.role_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          "rounded-md px-2 py-1 text-xs font-semibold",
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {user.is_superuser
                          ? "Superuser"
                          : "Standard"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/users/${user.id}`,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/users/${user.id}/edit`,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(user)
                            }
                            className="inline-flex h-9 items-center rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {users.length}
        </span>{" "}
        users
      </div>
    </div>
  );
}