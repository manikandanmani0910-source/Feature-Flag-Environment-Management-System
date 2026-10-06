import { useEffect, useState } from "react";

interface PercentageControlProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function PercentageControl({
  value = 0,
  onChange,
  disabled = false,
}: PercentageControlProps) {
  const [percentage, setPercentage] =
    useState(value);

  useEffect(() => {
    setPercentage(value);
  }, [value]);

  const updatePercentage = (
    nextValue: number,
  ) => {
    const safeValue = Math.min(
      100,
      Math.max(0, nextValue),
    );

    setPercentage(safeValue);
    onChange?.(safeValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          Rollout percentage
        </label>

        <span className="text-sm font-bold text-slate-900">
          {percentage}%
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={percentage}
        disabled={disabled}
        onChange={(event) =>
          updatePercentage(
            Number(event.target.value),
          )
        }
        className="w-full accent-slate-900 disabled:opacity-50"
      />

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      <input
        type="number"
        min={0}
        max={100}
        value={percentage}
        disabled={disabled}
        onChange={(event) =>
          updatePercentage(
            Number(event.target.value),
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50"
      />
    </div>
  );
}