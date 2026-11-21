export function AdminSelect({
  label,
  value,
  onChange,
  values,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly values: readonly { readonly value: string; readonly label: string }[];
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <select
        className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {values.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
