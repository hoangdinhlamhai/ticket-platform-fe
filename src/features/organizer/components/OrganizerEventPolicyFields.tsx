import type { ChangeEvent } from 'react'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'

type Props = {
  disabled?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  values: OrganizerEventFormValues
}

const inputClass =
  'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-soft'

export function OrganizerEventPolicyFields({ disabled, onChange, values }: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="text-xl font-extrabold text-ink">Lịch trình và chính sách</legend>
      <p className="m-0 text-sm leading-relaxed text-ink-soft">
        Các nội dung này mô tả bản nháp trong phiên; domain sự kiện P0 chỉ lưu thông tin vận hành cốt lõi.
      </p>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="organizer-event-schedule">
          Điểm nhấn lịch trình
        </label>
        <input
          id="organizer-event-schedule"
          name="scheduleSummary"
          className={inputClass}
          value={values.scheduleSummary}
          onChange={onChange}
          placeholder="Ví dụ: Đón khách, chương trình chính, kết thúc"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="organizer-event-policy">
          Chính sách hoàn vé
        </label>
        <input
          id="organizer-event-policy"
          name="policySummary"
          className={inputClass}
          value={values.policySummary}
          onChange={onChange}
          placeholder="Ví dụ: Hoàn vé trước 7 ngày"
        />
      </div>
    </fieldset>
  )
}
