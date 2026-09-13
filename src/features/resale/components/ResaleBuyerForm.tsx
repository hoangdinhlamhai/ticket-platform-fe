import { forwardRef, type ChangeEvent } from 'react'
import type { ResaleBuyer, ResaleCheckoutErrors } from '../types/resale'

type ResaleBuyerFormProps = {
  buyer: ResaleBuyer
  errors: ResaleCheckoutErrors
  onChange: (field: keyof ResaleBuyer, value: string) => void
}

const inputClass = 'mt-2 min-h-12 w-full rounded-md border border-line bg-surface px-4 text-base text-ink'

export const ResaleBuyerForm = forwardRef<(HTMLInputElement | null)[], ResaleBuyerFormProps>(function ResaleBuyerForm({ buyer, errors, onChange }, forwardedRef) {
  const setRef = (index: number) => (element: HTMLInputElement | null) => {
    if (typeof forwardedRef !== 'object' || !forwardedRef) return
    const inputs = forwardedRef.current
    if (inputs) inputs[index] = element
  }
  const update = (field: keyof ResaleBuyer) => (event: ChangeEvent<HTMLInputElement>) => onChange(field, event.target.value)

  return (
    <fieldset className="border-0 p-0">
      <legend className="font-body text-[clamp(2.3rem,4vw,3.5rem)] leading-[0.88] font-extrabold tracking-[-0.08em]">Thông tin người nhận vé</legend>
      <p className="mt-3 mb-0 text-sm leading-[1.6] text-ink-soft">Thông tin được điền sẵn từ hồ sơ. Thay đổi tại đây không cập nhật ngược vào hồ sơ.</p>
      <div className="mt-6 space-y-5">
        {([
          ['fullName', 'Họ và tên', 'text', 'name'],
          ['email', 'Email nhận vé', 'email', 'email'],
          ['phone', 'Số điện thoại', 'tel', 'tel'],
        ] as const).map(([field, label, type, autocomplete], index) => (
          <label key={field} className="block text-sm font-bold text-ink">
            {label} <span className="text-error">*</span>
            <input ref={setRef(index)} className={`${inputClass} ${errors[field] ? 'border-error ring-3 ring-error-ring' : ''}`} type={type} autoComplete={autocomplete} value={buyer[field]} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} onChange={update(field)} />
            {errors[field] && <span id={`${field}-error`} className="mt-2 block text-sm font-bold text-error" role="alert">{errors[field]}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
})
