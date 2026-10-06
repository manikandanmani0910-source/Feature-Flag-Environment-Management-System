interface SelectStatusProps {
  value: string;
  onChange: (
    value: string,
  ) => void;
  options?: string[];
  disabled?: boolean;
}

export function SelectStatus({
  value,
  onChange,
  options = [
    "all",
    "active",
    "inactive",
  ],
  disabled = false,
}: SelectStatusProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50"
    >
      {options.map(
        (option) => (
          <option
            key={option}
            value={option}
          >
            {option
              .charAt(0)
              .toUpperCase() +
              option.slice(1)}
          </option>
        ),
      )}
    </select>
  );
}