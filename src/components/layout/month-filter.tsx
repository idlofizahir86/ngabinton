import { getPeriod, type PeriodOption } from "@/lib/utils/period";

export type MonthFilterProps = {
  action: string;
  value: string;
  options: PeriodOption[];
  /** Nama query param, default `periode`. */
  name?: string;
  label?: string;
  /** Opsi "semua bulan" (mis. `{ value: "", label: "Semua bulan" }`). */
  allOption?: PeriodOption;
  /** Query param lain yang dipertahankan (mis. `type=income`). */
  hiddenParams?: Record<string, string | undefined>;
  className?: string;
};

/** Filter bulan berbasis form GET — tanpa JavaScript, bisa dipakai di server component. */
export function MonthFilter({
  action,
  value,
  options,
  name = "periode",
  label = "Bulan",
  allOption,
  hiddenParams,
  className,
}: MonthFilterProps) {
  const selectValue = allOption && value === allOption.value ? allOption.value : value;
  const hasValue = options.some((option) => option.value === value);
  const displayOptions =
    value && !hasValue && value !== allOption?.value
      ? [{ value, label: getPeriod(value).label }, ...options]
      : options;

  return (
    <form action={action} method="get" className={className}>
      <div className="flex flex-wrap items-end gap-2">
        {hiddenParams
          ? Object.entries(hiddenParams).map(([key, hiddenValue]) =>
              hiddenValue ? (
                <input key={key} type="hidden" name={key} value={hiddenValue} />
              ) : null,
            )
          : null}

        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</span>
          <select
            name={name}
            defaultValue={selectValue}
            className="min-w-44 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-focus"
          >
            {allOption ? <option value={allOption.value}>{allOption.label}</option> : null}
            {displayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
        >
          Terapkan
        </button>
      </div>
    </form>
  );
}
