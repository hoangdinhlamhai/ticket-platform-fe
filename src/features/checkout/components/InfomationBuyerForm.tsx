import type { ChangeEvent } from "react";
import type { AttendeeOrderBuyer } from "../../orders";
type Props = {
  buyer: AttendeeOrderBuyer;
  onChange: (field: keyof AttendeeOrderBuyer, value: string) => void;
};
const fields = [
  ["fullName", "Họ và tên", "text", "name"],
  ["email", "Email nhận vé", "email", "email"],
] as const;
export function PrimaryBuyerForm({ buyer, onChange }: Props) {
  const update =
    (field: keyof AttendeeOrderBuyer) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange(field, event.target.value);
  return (
    <fieldset className="rounded-lg border border-line bg-surface p-5">
      <legend className="px-2 font-body text-[clamp(2rem,4vw,3.25rem)] font-extrabold tracking-[-0.08em]">
        Thông tin nhận vé
      </legend>
      <p className="mt-2 text-sm text-ink-soft">
        Thông tin cá nhân được điền sẵn cho bạn.
      </p>
      <div className="mt-5 space-y-4">
        {fields.map(([field, label, type, autoComplete]) => (
          <label key={field} className="block text-sm font-bold">
            {label} <span className="text-error">*</span>
            <input
              className="mt-2 min-h-12 w-full rounded-md border border-line bg-paper px-4 text-base"
              type={type}
              autoComplete={autoComplete}
              value={buyer[field]}
              onChange={update(field)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
