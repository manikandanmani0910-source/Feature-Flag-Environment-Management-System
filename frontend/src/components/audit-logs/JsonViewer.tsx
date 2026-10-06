interface JsonViewerProps {
  value: unknown;
  emptyText?: string;
}

export function JsonViewer({
  value,
  emptyText = "No data available.",
}: JsonViewerProps) {
  if (
    value === undefined ||
    value === null
  ) {
    return (
      <div className="rounded-lg bg-slate-950 p-4 text-sm text-slate-400">
        {emptyText}
      </div>
    );
  }

  let output: string;

  if (typeof value === "string") {
    output = value;
  } else {
    try {
      output = JSON.stringify(
        value,
        null,
        2,
      );
    } catch {
      output = String(value);
    }
  }

  return (
    <pre className="max-h-[500px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-200">
      {output}
    </pre>
  );
}