import { forwardRef, type ChangeEvent } from 'react'
import type { AttendeeOrderBuyer } from '../../orders'
import type { PrimaryCheckoutErrors } from '../types/primary-checkout'
type Props = { buyer: AttendeeOrderBuyer; errors: PrimaryCheckoutErrors; onChange: (field: keyof AttendeeOrderBuyer, value: string) => void }
const fields = [['fullName', 'Họ và tên', 'text', 'name'], ['email', 'Email nhận vé', 'email', 'email'], ['phone', 'Số điện thoại', 'tel', 'tel']] as const
export const PrimaryBuyerForm = forwardRef<(HTMLInputElement | null)[], Props>(function PrimaryBuyerForm({ buyer, errors, onChange }, ref) {
  const setRef = (index: number) => (node: HTMLInputElement | null) => { if (typeof ref === 'object' && ref?.current) ref.current[index] = node }
  const update = (field: keyof AttendeeOrderBuyer) => (event: ChangeEvent<HTMLInputElement>) => onChange(field, event.target.value)
  return <fieldset className="rounded-lg border border-line bg-surface p-5"><legend className="px-2 font-body text-[clamp(2rem,4vw,3.25rem)] font-extrabold tracking-[-0.08em]">Thông tin nhận vé</legend><p className="mt-2 text-sm text-ink-soft">Điền sẵn từ hồ sơ mock và chỉ dùng trong phiên checkout này.</p><div className="mt-5 space-y-4">{fields.map(([field, label, type, autoComplete], index) => <label key={field} className="block text-sm font-bold">{label} <span className="text-error">*</span><input ref={setRef(index)} className={`mt-2 min-h-12 w-full rounded-md border bg-paper px-4 text-base ${errors[field] ? 'border-error ring-3 ring-error-ring' : 'border-line'}`} type={type} autoComplete={autoComplete} value={buyer[field]} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `primary-${field}-error` : undefined} onChange={update(field)} />{errors[field] && <span id={`primary-${field}-error`} className="mt-2 block text-sm font-bold text-error" role="alert">{errors[field]}</span>}</label>)}</div></fieldset>
})
