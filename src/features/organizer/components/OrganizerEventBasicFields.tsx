import type { ChangeEvent } from 'react'
import type { OrganizerEventErrors } from '../helpers/validate-organizer-event.ts'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'

type Props = {
  disabled?: boolean
  errors: OrganizerEventErrors
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  registerField: (field: 'title') => (node: HTMLInputElement | null) => void
  values: OrganizerEventFormValues
}

const inputClass = 'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-soft aria-[invalid=true]:border-error'

export function OrganizerEventBasicFields({ disabled, errors, onChange, registerField, values }: Props) {
  const errorId = 'organizer-event-title-error'
  return <fieldset disabled={disabled} className="space-y-4"><legend className="text-xl font-extrabold text-ink">Thông tin cơ bản</legend><div><label className="mb-2 block text-sm font-bold" htmlFor="organizer-event-title">Tên sự kiện <span className="text-error">*</span></label><input ref={registerField('title')} id="organizer-event-title" name="title" className={inputClass} value={values.title} onChange={onChange} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? errorId : undefined} autoComplete="off" />{errors.title && <p id={errorId} className="mt-2 text-sm font-bold text-error" role="alert">{errors.title}</p>}</div></fieldset>
}
