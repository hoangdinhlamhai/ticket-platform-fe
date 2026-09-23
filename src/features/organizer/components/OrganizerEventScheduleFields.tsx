import type { ChangeEvent } from 'react'
import type { OrganizerEventErrors } from '../helpers/validate-organizer-event.ts'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'

type Props = {
  disabled?: boolean
  errors: OrganizerEventErrors
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  registerField: (field: string) => (node: HTMLInputElement | HTMLSelectElement | null) => void
  values: OrganizerEventFormValues
}

const inputClass =
  'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue disabled:bg-paper-deep aria-[invalid=true]:border-error'

export function OrganizerEventScheduleFields({
  disabled,
  errors,
  onChange,
  registerField,
  values,
}: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="text-xl font-extrabold text-ink">Thời gian và địa điểm</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['startsAt', 'endsAt'] as const).map((name) => (
          <label key={name} className="block text-sm font-bold">
            {name === 'startsAt' ? 'Bắt đầu' : 'Kết thúc'} *
            <input
              ref={registerField(name)}
              name={name}
              type="datetime-local"
              className={inputClass}
              value={values[name]}
              onChange={onChange}
              aria-invalid={Boolean(errors[name])}
            />
            {errors[name] && (
              <span className="block text-sm font-bold text-error" role="alert">
                {errors[name]}
              </span>
            )}
          </label>
        ))}
      </div>
      <p className="m-0 text-sm text-ink-soft">
        Địa điểm đã được khai báo ở bước 1 gồm tỉnh/thành phố, phường/xã và đường/phố.
      </p>
    </fieldset>
  )
}
