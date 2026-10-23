import type { ChangeEvent } from "react";

type Props = {
  disabled: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base outline-none disabled:bg-paper-deep";

export function OrganizerEventStepConfirmation({
  disabled,
  value,
  onChange,
}: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="text-xl font-extrabold">Xác nhận sau khi mua</legend>
      <label
        className="block text-sm font-bold"
        htmlFor="organizer-confirmation-message"
      >
        Tin nhắn xác nhận
        <textarea
          id="organizer-confirmation-message"
          name="confirmationMessage"
          maxLength={500}
          className={inputClass}
          value={value}
          onChange={onChange}
        />
      </label>
      <p className="text-right text-xs text-ink-soft">{value.length}/500</p>
    </fieldset>
  );
}
