import type { ChangeEvent } from 'react'
import type { OrganizerEventErrors } from '../helpers/validate-organizer-event.ts'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'

type Props = {
  disabled?: boolean
  errors: OrganizerEventErrors
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  registerField: (field: 'startsAt' | 'endsAt' | 'venue' | 'city') => (node: HTMLInputElement | null) => void
  values: OrganizerEventFormValues
}

const inputClass = 'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-soft aria-[invalid=true]:border-error'
const fields = [['startsAt', 'Bắt đầu'], ['endsAt', 'Kết thúc']] as const

export function OrganizerEventScheduleFields({ disabled, errors, onChange, registerField, values }: Props) {
  return <fieldset disabled={disabled} className="space-y-4"><legend className="text-xl font-extrabold text-ink">Thời gian và địa điểm</legend><div className="grid gap-4 sm:grid-cols-2">{fields.map(([name, label]) => { const errorId = `organizer-event-${name}-error`; return <div key={name}><label className="mb-2 block text-sm font-bold" htmlFor={`organizer-event-${name}`}>{label} <span className="text-error">*</span></label><input ref={registerField(name)} id={`organizer-event-${name}`} name={name} type="datetime-local" className={inputClass} value={values[name]} onChange={onChange} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? errorId : undefined} />{errors[name] && <p id={errorId} className="mt-2 text-sm font-bold text-error" role="alert">{errors[name]}</p>}</div>})}</div><div><label className="mb-2 block text-sm font-bold" htmlFor="organizer-event-venue">Địa điểm <span className="text-error">*</span></label><input ref={registerField('venue')} id="organizer-event-venue" name="venue" className={inputClass} value={values.venue} onChange={onChange} aria-invalid={Boolean(errors.venue)} aria-describedby={errors.venue ? 'organizer-event-venue-error' : undefined} />{errors.venue && <p id="organizer-event-venue-error" className="mt-2 text-sm font-bold text-error" role="alert">{errors.venue}</p>}</div><div><label className="mb-2 block text-sm font-bold" htmlFor="organizer-event-city">Tỉnh/thành phố <span className="text-error">*</span></label><input ref={registerField('city')} id="organizer-event-city" name="city" className={inputClass} value={values.city} onChange={onChange} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'organizer-event-city-error' : undefined} />{errors.city && <p id="organizer-event-city-error" className="mt-2 text-sm font-bold text-error" role="alert">{errors.city}</p>}</div></fieldset>
}
