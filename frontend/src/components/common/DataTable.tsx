import type {
  ReactNode,
} from "react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (
    item: T,
    index: number,
  ) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: (
    item: T,
    index: number,
  ) => string | number;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "No data available.",
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            {columns.map(
              (column) => (
                <th
                  key={column.key}
                  className={[
                    "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    column.className ?? "",
                  ].join(" ")}
                >
                  {column.header}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(
              (item, index) => (
                <tr
                  key={
                    rowKey
                      ? rowKey(
                          item,
                          index,
                        )
                      : index
                  }
                  className="transition hover:bg-slate-50"
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={column.key}
                        className="px-5 py-4 text-sm text-slate-600"
                      >
                        {column.render
                          ? column.render(
                              item,
                              index,
                            )
                          : String(
                              (
                                item as Record<
                                  string,
                                  unknown
                                >
                              )[column.key] ??
                                "",
                            )}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )
          )}
        </tbody>
      </table>
    </div>
  );
}