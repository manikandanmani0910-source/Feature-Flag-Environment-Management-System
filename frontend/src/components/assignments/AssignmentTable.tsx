import { AssignmentStatus } from "./AssignmentStatus";

interface Assignment {
  id: number | string;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  user_id?: number | string | null;
  enabled?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AssignmentTableProps {
  assignments: Assignment[];
  loading?: boolean;
  onEdit?: (
    assignment: Assignment,
  ) => void;
  onDelete?: (
    assignment: Assignment,
  ) => void;
}

export function AssignmentTable({
  assignments,
  loading = false,
  onEdit,
  onDelete,
}: AssignmentTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assignment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Environment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              {(onEdit || onDelete) && (
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {assignments.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onEdit || onDelete
                      ? 6
                      : 5
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map(
                (assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Assignment #
                        {assignment.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {assignment.feature_flag_id !=
                      null
                        ? `Feature #${assignment.feature_flag_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {assignment.environment_id !=
                      null
                        ? `Environment #${assignment.environment_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {assignment.user_id !=
                      null
                        ? `User #${assignment.user_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <AssignmentStatus
                        enabled={
                          assignment.enabled ??
                          false
                        }
                      />
                    </td>

                    {(onEdit || onDelete) && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(
                                  assignment,
                                )
                              }
                              className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                            >
                              Edit
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                onDelete(
                                  assignment,
                                )
                              }
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}